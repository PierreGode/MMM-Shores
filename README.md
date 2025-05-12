# MMM-Chores
Manage and keep track of your household Chores
<p>
  
<img src="https://github.com/user-attachments/assets/88849ed9-0961-4aeb-a2f3-66e0d91f16a8" width="350" />

![image](https://github.com/user-attachments/assets/3170e312-f368-4df3-ac6c-dd2ffd95834f)



```
  {
    module: "MMM-Chores",
    position: "top_left",
    config: {
      updateInterval: 60 * 1000,
      adminPort: 5003,
      showDays: 3   // show tasks dated today, tomorrow, and the day after
    }
  }
```

```
cd MagicMirror/modules
git clone https://github.com/PierreGode/MMM-Chores.git
cd MMM-Chores
npm install
```


Go to http://yourmirrorIP:5003/ #page will be reachable within same network. ( NOT recomended to expose outside network )

Data is stored in data.json to make the data persistent between restarts.
