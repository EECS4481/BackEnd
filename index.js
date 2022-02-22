const express = require('express');
const app = express();
const port = process.argv[2] || 4000;
const path = require('path');
const sha256 = require('js-sha256');

const session = require('express-session');
app.enable('trust proxy');

const dao = require('./dao.js');
const { json } = require('body-parser');
const { count } = require('console');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
});

app.use((req, res, next) => {
    console.log(`From ${req.ip}, Request ${req.url}`);
    next();
});

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    proxy: true,
}));

//  global variables
const uid = 0;
const active = [];

//  connection test
app.get('/', (req, res) => {
    console.log('Request ' + req.url + ' from ' + req.ip);
    res.setHeader('Content-Type', 'text/plain');
    res.write('Hello World!');
    res.end();
});

//  produce client ID and add it to the table and return it
app.get('/api/getClientId', (req, res) => {
    let id = 'C' + uid;
    uid += 1;
    let user = {client_id: id};
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(user));
    dao.getClientId(id, () => {});
    res.end();
});

//  Get email and password --> if authentication succeeded returns name and id else return empty array
app.get('/api/login/:email/:password', (req, res) => {
    req.params.password = sha256(req.params.password);
    dao.getProviderByEmail(req.params, (user) => {
        res.setHeader('Content-Type', 'application/json');
        //  user.length --> gives us the number of elements in array
        res.write(JSON.stringify(user));
        //  add the user in global active array
        if(active.indexOf(user.provider_id) == -1){
            active.push(user.provider_id);
        }
        res.end();
    });
});

//  remove the user from active array
app.get('/api/logout/:id', (req, res) => {
    const index = active.indexOf(req.params.id);
    if (index > -1) {
        active.splice(index, 1);
        res.setHeader('Content-Type', 'text/plain');
        res.send("you have logged out successfully");
    } else {
        console.log('error');
        res.end();
    }
});

//  get full chat history
app.get('/api/getConversationHistory/:sender/:receiver', (req, res) => {
    dao.getConversationHistory(req.params, (chat) => {
        res.setHeader('Content-Type', 'application/json');
        res.write(JSON.stringify(chat));
        res.end();
    });
});

//  add to message table and the return the whole chat history with new message
app.post('/api/addConversation', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    dao.postConversation(req.body, () => {
        dao.getConversationHistory(req.body, (chat) => {
            res.setHeader('Content-Type', 'application/json');
            res.write(JSON.stringify(chat));
            res.end();
        });
    });
});

// Chat Table API --> Not Working right now
app.get('/api/createChat/:user1/:user2', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    dao.createChat(req.params, (chat) => {});
    res.end();
});

const server = app.listen(port, function(){
    const host = server.address().address;
    const port = server.address().port;
    console.log(`server listening to ${host}:${port}`);
});