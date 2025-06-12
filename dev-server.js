// Simple standalone server for the MMM-Chores admin interface
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');

let openaiLoaded = true;
let OpenAI;
try {
  OpenAI = require('openai').OpenAI;
} catch (err) {
  openaiLoaded = false;
}

const DATA_FILE = path.join(__dirname, 'data.json');
const CERT_DIR = path.join(__dirname, 'certs');

let tasks = [];
let people = [];
let analyticsBoards = [];
let settings = { language: 'en' };

function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const j = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      tasks           = j.tasks           || [];
      people          = j.people          || [];
      analyticsBoards = j.analyticsBoards || [];
      settings        = j.settings        || { language: 'en', dateFormatting: 'yyyy-mm-dd' };
      console.log(`Loaded ${tasks.length} tasks, ${people.length} people, ${analyticsBoards.length} analytics boards`);
    } catch (e) {
      console.error('Error reading data.json:', e);
    }
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ tasks, people, analyticsBoards, settings }, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing data.json:', e);
  }
}

async function aiGenerateTasks(req, res) {
  if (!openaiLoaded) {
    return res.status(400).json({ success: false, error: "openai package not installed" });
  }
  if (!settings.openaiApiKey) {
    return res.status(400).json({ success: false, error: "OpenAI token missing" });
  }

  const completedCount = tasks.filter(t => t.done === true).length;
  const requiredCount = 30;
  if (completedCount < requiredCount) {
    const amountLeft = requiredCount - completedCount;
    return res.status(400).json({
      success: false,
      error: `Too little data. Please complete ${amountLeft} more task${amountLeft > 1 ? 's' : ''} to unlock AI generation.`
    });
  }

  try {
    const openai = new OpenAI({ apiKey: settings.openaiApiKey });
    const prompt = buildPromptFromTasks();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'system',
          content:
            "You are an assistant that, given historical household-task data," +
            "creates a schedule for the next 7 days." +
            "Return ONLY a JSON array of tasks with fields name, date (yyyy-mm-dd), assignedTo (person id)."
        },
        { role: 'user', content: prompt }
      ]
    });
    const text = completion.choices[0]?.message?.content || '[]';
    const newTasks = JSON.parse(text);
    const createdTasks = [];
    newTasks.forEach(t => {
      if (t && t.name && t.date) {
        const task = { id: Date.now() + Math.random(), ...t, done: false, assignedTo: t.assignedTo || null };
        tasks.push(task);
        createdTasks.push(task);
      }
    });
    saveData();
    res.json({ success: true, createdTasks, count: createdTasks.length });
  } catch (err) {
    console.error('AI Generate error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

function buildPromptFromTasks() {
  const relevantTasks = tasks.filter(t => t.done === true).map(t => ({
    name: t.name,
    assignedTo: t.assignedTo,
    date: t.date,
    done: t.done,
    deleted: t.deleted || false,
    created: t.created
  }));

  const todayString = new Date().toLocaleDateString('sv-SE', {
    weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric'
  });

  return JSON.stringify({
    instruction:
      `Idag är ${todayString}. ` +
      "Analysera historiska uppgifter för att förstå vilken dag i veckan olika personer brukar göra specifika sysslor. " +
      "Baserat på detta, generera nya uppgifter för de kommande 7 dagarna med korrekt tilldelning av rätt person på rätt dag. " +
      "Returnera ENDAST en JSON-array med objekt som innehåller: name, date (yyyy-mm-dd), assignedTo (person id).",
    today: new Date().toISOString().slice(0, 10),
    tasks: relevantTasks,
    people: people
  });
}

function createServer(port) {
  const app = express();

  app.use(bodyParser.json());
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  });

  app.get('/api/people', (req, res) => res.json(people));
  app.post('/api/people', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const newPerson = { id: Date.now(), name };
    people.push(newPerson);
    saveData();
    res.status(201).json(newPerson);
  });
  app.delete('/api/people/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    people = people.filter(p => p.id !== id);
    tasks  = tasks.map(t => t.assignedTo === id ? { ...t, assignedTo: null } : t);
    saveData();
    res.json({ success: true });
  });

  app.get('/api/tasks', (req, res) => {
    const visibleTasks = tasks.filter(t => !t.deleted);
    res.json(visibleTasks);
  });
  app.post('/api/tasks', (req, res) => {
    const newTask = { id: Date.now(), ...req.body, done: false, assignedTo: null };
    tasks.push(newTask);
    saveData();
    res.status(201).json(newTask);
  });
  app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    Object.entries(req.body).forEach(([key, val]) => {
      if (val === undefined || val === null) {
        delete task[key];
      } else {
        task[key] = val;
      }
    });
    saveData();
    res.json(task);
  });
  app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const task = tasks.find(t => t.id === id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    task.deleted = true;
    saveData();
    res.json({ success: true });
  });

  app.get('/api/analyticsBoards', (req, res) => res.json(analyticsBoards));
  app.post('/api/analyticsBoards', (req, res) => {
    const newBoards = req.body;
    if (!Array.isArray(newBoards)) {
      return res.status(400).json({ error: 'Expected an array of board types' });
    }
    analyticsBoards = newBoards;
    saveData();
    res.json({ success: true, analyticsBoards });
  });

  app.get('/api/settings', (req, res) => res.json(settings));
  app.put('/api/settings', (req, res) => {
    const newSettings = req.body;
    if (typeof newSettings !== 'object') {
      return res.status(400).json({ error: 'Invalid settings data' });
    }
    Object.entries(newSettings).forEach(([key, val]) => {
      settings[key] = val;
    });
    saveData();
    res.json({ success: true, settings });
  });

  app.post('/api/ai-generate', aiGenerateTasks);

  app.listen(port, '0.0.0.0', () => {
    console.log(`MMM-Chores admin running at http://localhost:${port}`);
  });

  const httpsPort = port + 1;
  const keyPath = path.join(CERT_DIR, 'server.key');
  const certPath = path.join(CERT_DIR, 'server.crt');
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    const options = { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) };
    https.createServer(options, app).listen(httpsPort, '0.0.0.0', () => {
      console.log(`MMM-Chores admin (HTTPS) running at https://localhost:${httpsPort}`);
    });
  }
}

loadData();
const port = parseInt(process.env.PORT, 10) || 5003;
createServer(port);
