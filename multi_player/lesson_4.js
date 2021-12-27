const { randomUUID } = require('crypto');
const express = require('express');
const app = express();
app.use(express.static('public'));
const users = new Map();
require('express-ws')(app);
app.listen(80);

app.ws('/', function(ws, req) {
  ws.uuid = randomUUID();
  users.set(ws.uuid, ws);
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