const { randomUUID } = require('crypto');
const express = require('express');
const app = express();
app.use(express.static('public'));
const users = new Map();
require('express-ws')(app);
app.listen(80);

let ball                = {x: 300, y: 300, vx:   1  , vy : 5};
let player1             = {x: 200, y: 700, len:  50 , dir: 0,  point: 0};
let player2             = {x: 200, y: 100, len:  50 , dir: 0,  point: 0};

app.ws('/', function(ws, req) {
  ws.uuid = randomUUID();
  users.set(ws.uuid, ws);
  if (users.size == 1) ws.player = player1;
  if (users.size == 2) ws.player = player2;
  ws.on('message', function(message) {
     let msg = JSON.parse(message);
     if(msg.cmd == 'keydown' && msg.data == "ArrowLeft" && ws.player) ws.player.dir = -5;
     if(msg.cmd == 'keydown' && msg.data == "ArrowRight" && ws.player) ws.player.dir = 5;
     if(msg.cmd == 'keyup' && ws.player) ws.player.dir = 0;
     ws.send(JSON.stringify({msg: "id", data:JSON.stringify(ws.uuid)}));
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
   player1.x   = player1.x + player1.dir;
   player2.x   = player2.x + player2.dir;
  setTimeout(render, 15);
  sendAll(JSON.stringify({msg:"update", data: {ball, player1, player2}}));
}