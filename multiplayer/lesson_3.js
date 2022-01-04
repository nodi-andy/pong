const { randomUUID } = require('crypto');
const express = require('express');
const app = express();
const users = new Map();
require('express-ws')(app);
let player1             = {x: 200, y: 700, len:  50 , dir: 0,  point: 0};
let player2             = {x: 200, y: 100, len:  50 , dir: 0,  point: 0};

app.use(express.static('public'));
app.listen(80);

app.ws('/', function(ws, req) {
  ws.uuid = randomUUID();
  users.set(ws.uuid, ws);
  if (users.size == 1) ws.player = player1;
  if (users.size == 2) ws.player = player2;
  ws.on('message', function(message) {
    console.log(message);
  });
  ws.on('close', function() {
    if (ws.uuid) users.delete(ws.uuid);
  });
});

function sendAll(message) {
  users.forEach((val, key) => {
    val.send(message);
  })
}

render();
function render(){ 
  setTimeout(render, 15);
  sendAll(JSON.stringify({msg:"update", data: "updateData"}));
}