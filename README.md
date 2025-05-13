# MMM-Chores
Manage and keep track of your household Chores
<p>
  
<img src="https://github.com/user-attachments/assets/88849ed9-0961-4aeb-a2f3-66e0d91f16a8" width="350" />
<p></p>


<img src="https://github.com/user-attachments/assets/258844d6-6457-4b48-ac64-af637ec059a4" width="800" />


______________________________________________________________________________________________



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


______________________________________________________________________________________________
______________________________________________________________________________________________


If you wish to use push notifications follow guide below. 


![image](https://github.com/user-attachments/assets/aa99d0b8-c31e-41f9-b7b9-e4a8d93cd9d1)

# 1. in MagicMirror/modules/MMM-Chores create a folder certs
```
mkdir MagicMirror/modules/MMM-Chores/certs
```

# 2. Generate a private key in MMM-Chores/certs
```
openssl genrsa -out server.key 2048
```
# 3. Create a certificate signing request (CSR)
```
openssl req -new -key server.key -out server.csr -subj "/C=SE/ST=Stockholm/L=Stockholm/O=Home/CN=192.168.1.192" <--- YOUR IP
```

# 4. Generate a self-signed cert valid for 1 year
```
openssl x509 -req -in server.csr -signkey server.key -out server.crt -days 365
```

copy /certs/server.crt and install on your devices.

browse to https://yourmirrorIP:5004/ and allow push notifications
> [!NOTE]
> And yes everything will yell unsafe, warning warning, Not Secure, that is what happens when you do a selfsigned certificate and not a micrsoft signed cert for loads of money ;P

