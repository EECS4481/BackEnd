const express = require("express");
const crypto = require("crypto");
const app = express();
const port = process.argv[2] || 4000;
const path = require("path");
const sha256 = require("js-sha256");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const upload = require("express-fileupload");
const fs = require("fs");
const validator = require("validator");

const session = require("express-session");
app.enable("trust proxy");
app.use(cookieParser());
app.use(cors());

const dao = require("./dao.js");
const { read } = require("fs");
const { json } = require("body-parser");
const { count } = require("console");
const file = require("fs-extra/lib/ensure/file");
const { uploadFile } = require("./dao.js");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use((req, res, next) => {
  console.log(`From ${req.ip}, Request ${req.url}`);
  next();
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    proxy: true,
  })
);

app.use(upload());

//  global variables
let uid = 0;
let active = [];
let ready = [];
let inchat = []; //  {provider_id: 'id', client_id: 'id'}
let ppc = []; //  {provider1_id: 'id', provider2_id: 'id'}
let transfer = [];

//  connection test
app.get("/", (req, res) => {
  console.log("Request " + req.url + " from " + req.ip);
  res.setHeader("Content-Type", "text/plain");
  res.write("Hello World!");
  res.end();
});

//  produce client ID and add it to the table and return it
app.get("/api/getClientId", (req, res) => {
  let id = "C" + uid;
  uid += 1;
  let user = { client_id: id };
  res.setHeader("Content-Type", "application/json");
  res.write(JSON.stringify(user));
  dao.getClientId(id, () => {});
  res.end();
});

//  Get email and password --> if authentication succeeded returns name and id else return empty array
app.get("/api/login/:email/:password", (req, res) => {
  req.params.password = sha256(req.params.password);
  dao.getProviderByEmail(req.params, (user) => {
    res.setHeader("Content-Type", "application/json");
    if (user == null) {
      //  if credentials are wrong we will get empty object
      res.write(JSON.stringify({ name: "", provider_id: "" }));
    } else {
      //  if credentials are correct we will get name and provider ID
      const cookie = generateCookie();
      res.cookie("session", cookie, { maxAge: 1000, http: false });
      dao.addCookie(
        user.provider_id,
        cookie,
        () => {
          res.write(JSON.stringify(user));
          //  add the user in global active array
          if (active.indexOf(user.provider_id) === -1) {
            active.push(user.provider_id);
          }
          res.end();
        },
        (error) => {
          res.write(error);
          res.end();
        }
      );
    }
  });
});

// generating cookie
const generateCookie = function () {
  // 16 bytes is likely to be more than enough,
  // but you may tweak it to your needs
  return crypto.randomBytes(16).toString("base64");
};

// just for testing cookie value
app.get("/api/authenticate/:id", (req, res) => {
  const id = req.params.id;
  const session = req.cookies.session;

  dao.authenticate(
    id,
    session,
    () => {
      res.write("Valid session");
      res.end();
    },
    () => {
      res.write("Invalid session");
      res.end();
    }
  );
});

//  remove the user from active array
app.get("/api/logout/:id", (req, res) => {
  const session = req.cookies.session;
  dao.removeSession(req.params.id, session);
  const index = active.indexOf(req.params.id);
  // we also have to remove from the ready queue
  const readyIndex = ready.indexOf(req.params.id);
  if (readyIndex > -1) {
    ready.splice(readyIndex, 1);
  }
  if (index > -1) {
    active.splice(index, 1);
    res.setHeader("Content-Type", "text/plain");
    res.send("you have logged out successfully");
  } else {
    console.log("This User was not Active");
    res.end();
  }
});

//  get full chat history
app.get("/api/getConversationHistory/:sender/:receiver", (req, res) => {
  dao.getConversationHistory(req.params, (chat) => {
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify(chat));
    res.end();
  });
});

//  add to message table and the return the whole chat history with new message
app.post("/api/addConversation", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  console.log(req);
  dao.postConversation(req.body, () => {
    dao.getConversationHistory(req.body, (chat) => {
      res.setHeader("Content-Type", "application/json");
      res.write(JSON.stringify(chat));
      res.end();
    });
  });
});

//  add a file to the chat
app.get("/api/upload", (req, res) => {
  res.sendFile(__dirname + "/index.html");
  // res.end();
});

// get client ID to store the files to its subfolder
app.post("/api/upload", (req, res) => {
  if (req.files) {
    var file = req.files.file;
    var filename = file.name;
    var saveName = Date.now() + "_" + filename;
    // var dir = './FILES/';
    // console.log(dir);
    // try {
    //   if(!fs.existsSync(dir)) {
    //     fs.mkdirSync(dir);
    //     console.log("Directory is Creadted.")
    //   } else {
    //     console.log("Directory is already exists.")
    //   }
    // } catch(err) {
    //   console.log(err);
    // }
    file.mv("./Files/" + saveName, (err) => {
      if (err) {
        console.log(err);
        res.end();
      } else {
        res.write(saveName);
        dao.uploadFile(req.body.sender, req.body.receiver, saveName);
        res.end("File Uploaded succesfully");
      }
    });
  } else {
    res.end("error!");
  }
});

// download the requestd file from Files folder (don't forget its suffix)
app.get("/api/download/:filename", (req, res) => {
  // var file = `${__dirname}/Files/${req.params.filename}`;
  // console.log(file);
  // res.write(res.download(file));
  // res.end();
  fs.readFile("./Files/" + req.params.filename, (err, data) => {
    console.log(data);
    res.end(data);
  });
});

//  add to or remove from transfer array the client
//  send for status:    add client to array
//  receive for status: remove client from tansfer array
app.get("/api/clientTransfer/:clientID/:status", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  if (req.params.status == "send") {
    if (transfer.indexOf(req.params.clientID) == -1) {
      transfer.push(req.params.clientID);
    }
    res.send(req.params.clientID);
  } else if (req.params.status == "receive") {
    let index = transfer.indexOf(req.params.clientID);
    if (index != -1) {
      transfer.splice(index, 1);
    }
    res.send(req.params.clientID);
  } else {
    res.send("Bad Request!");
  }
});

//  this methods add the providers to ready list
app.get("/api/providerReady/:id", (req, res) => {
  res.setHeader("Content-Type", "text/plain");

  const id = req.params.id;
  const session = req.cookies.session;
  dao.authenticate(
    id,
    session,
    () => {
      if (ready.indexOf(req.params.id) == -1) {
        ready.push(req.params.id);
      }
      res.end("you are added to ready providers list!");
    },
    () => {
      res.write("Authentication failed");
      res.end();
    }
  );
});

// takes no parameters
// returns a list of all available providers
app.get("/api/readyProviders", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.end(JSON.stringify(ready));
});

// transfers a client to a new provider
app.get("/api/transferClient/:cid/:from", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const id = req.params.from;
  const session = req.cookies.session;

  dao.authenticate(
    id,
    session,
    () => {
      let pid = null;
      // finding some other provider
      ready.forEach((p) => {
        if (p != req.params.from) {
          pid = p;
        }
      });

      if (pid == null) {
        res.send(JSON.stringify({ status: "No other Provider is ready!" }));
      } else {
        let obj = { provider_id: pid, client_id: req.params.cid };
        if (inchat.indexOf(obj) == -1) {
          inchat.push(obj);
        }

        let index = inchat.length - 1;

        // removing the old provider from chat
        while (index >= 0) {
          let item = inchat[index];
          if (
            item.provider_id == req.params.from &&
            item.client_id == req.params.cid
          ) {
            inchat.splice(index, 1);
          }
          index--;
        }

        console.log(inchat);
        res.send(JSON.stringify(obj));
      }
    },
    () => {
      res.write("Invalid session");
      res.end();
    }
  );
});

//  remove the first provider from ready list and add the
//  provider and client to the inchat list
//  and returns both parties
//  also prevents client to opens more than 1 chat
app.get("/api/startChat/:cid", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let index = -1;
  for (i = 0; i < inchat.length; i++) {
    if (inchat[i].client_id == req.params.cid) {
      index = i;
    }
  }
  if (index != -1) {
    res.send(JSON.stringify({ status: "You are already in the chat!" }));
  } else {
    let pid = ready.shift();
    if (pid == null) {
      res.send(JSON.stringify({ status: "No Provider is ready!" }));
    } else {
      let obj = { provider_id: pid, client_id: req.params.cid };
      if (inchat.indexOf(obj) == -1) {
        inchat.push(obj);
      }
      console.log(inchat);
      res.send(JSON.stringify(obj));
    }
  }
});

app.get("/api/checkProvider/:cid", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let index = inchat.length - 1;
  // removing the old provider from chat
  while (index >= 0) {
    let item = inchat[index];
    if (item.client_id == req.params.cid) {
      console.log(item);
      res.send(item);
      return;
    }
    index--;
  }
  res.send("");
});

//  first id is for the provider who start chat the next
//  is the other provider
//  add both party to ppc list
app.get("/api/startChatPP/:p1id/:p2id", (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const id = req.params.p1id;
  const session = req.cookies.session;

  dao.authenticate(
    id,
    session,
    () => {
      let obj = {
        provider1_id: req.params.p1id,
        provider2_id: req.params.p2id,
      };
      if (req.params.p1id == req.params.p2id) {
        res.send(JSON.stringify({ status: "You cannot chat with yourself:)" }));
      } else {
        let index = -1;
        for (i = 0; i < ppc.length; i++) {
          if (
            (ppc[i].provider1_id == req.params.p1id &&
              ppc[i].provider2_id == req.params.p2id) ||
            (ppc[i].provider1_id == req.params.p2id &&
              ppc[i].provider2_id == req.params.p1id)
          ) {
            index = i;
          }
        }
        if (index == -1) {
          ppc.push(obj);
          console.log(ppc);
          res.send(JSON.stringify(obj));
        } else {
          res.send(JSON.stringify({ status: "The chat is already existed!" }));
        }
      }
    },
    () => {
      res.send("Authentication failed");
    }
  );
});

//  when chat endded the both party will be removed from the inchat list
//  client should write client as second argument
//  provider should write provider as second argument
app.get("/api/endChat/:id", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let index = -1;
  for (i = 0; i < inchat.length; i++) {
    if (
      inchat[i].provider_id == req.params.id ||
      inchat[i].client_id == req.params.id
    ) {
      index = i;
    }
  }
  if (index > -1) {
    inchat.splice(index, 1);
    console.log(inchat);
    res.send("chat endded succesfully!");
  } else {
    res.send("There is no chat!");
  }
});

//  when chat endded the both party will be removed from the ppc list
//  to request the user enter both parties id (themselves first)
//  chat will be removed
app.get("/api/endChatPP/:p1id/:p2id", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let obj = { provider1_id: req.params.p1id, provider2_id: req.params.p2id };
  let objR = { provider1_id: req.params.p2id, provider2_id: req.params.p1id };
  let index = -1;
  for (i = 0; i < ppc.length; i++) {
    if (ppc[i] == obj || ppc[i] == objR) {
      index = i;
    }
  }
  if (index > -1) {
    ppc.splice(index, 1);
    console.log(ppc);
    res.send("chat endded succesfully!");
  } else {
    res.send("There is no chat!");
  }
});

//  get provider id and check if the provider in the chat
//  return both parties of the chat if the chat exist
app.get("/api/provideChatCheck/:id/:party", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.params.party == "provider") {
    let conversations = [];
    for (i = 0; i < ppc.length; i++) {
      if (
        ppc[i].provider1_id == req.params.id ||
        ppc[i].provider2_id == req.params.id
      ) {
        conversations.push(ppc[i]);
      }
    }
    if (conversations.length == 0) {
      res.send(JSON.stringify({ status: "There is no chat for you!" }));
    } else {
      res.send(ppc);
      res.end();
    }
  } else if (req.params.party == "client") {
    let conversations = [];
    for (i = 0; i < inchat.length; i++) {
      if (inchat[i].provider_id == req.params.id) {
        conversations.push(inchat[i]);
      }
    }
    if (conversations.length == 0) {
      res.send(JSON.stringify({ status: "There is no chat for you!" }));
    } else {
      res.send(inchat);
      res.end();
    }
  } else {
    res.send(JSON.stringify({ status: "Bad Request!" }));
  }
});

const server = app.listen(port, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`server listening to ${host}:${port}`);
});
