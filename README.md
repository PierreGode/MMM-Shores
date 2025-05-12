# MMM-Chores
Manage and keep track of your household Chores
<p>
  
<img src="https://github.com/user-attachments/assets/88849ed9-0961-4aeb-a2f3-66e0d91f16a8" width="350" />
<p></p>


<img src="https://github.com/user-attachments/assets/258844d6-6457-4b48-ac64-af637ec059a4" width="800" />





Data is stored in data.json to make the data persistent between restarts.


```
  {
    module: "MMM-Chores",
    position: "top_left",
    config: {
      updateInterval: 60 * 1000,
      adminPort: 5003,
      showDays: 3,  // show tasks dated today, tomorrow, and the day after
      showPast: true   // also show unfinished tasks from past days
    }
  },
```

```
cd MagicMirror/modules
git clone https://github.com/PierreGode/MMM-Chores.git
cd MMM-Chores
npm install
```


Go to http://yourmirrorIP:5003/ #page will be reachable within same network.
> [!CAUTION]
> DO NOT expose application with portforward



