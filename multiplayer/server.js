const express = require('express');
const app = express();
app.use(express.static('public'));
require('express-ws')(app);
app.listen(80);

const users = new Map();

let ball       = generateBall();
let player1    = {x: 50, y: 350, len:  50 , dir: 0,  mdir: 1, point: 0, active: false, name: "player1"};
let player2    = {x: 700, y: 350, len:  50 , dir: 0,  mdir: -1, point: 0, active: false, name: "player2"};

app.ws('/', function(ws, req) {
  users.set(ws, 1);
  ws.on('message', function(message) {
    let msg = JSON.parse(message);
    if (msg.cmd == 'keydown' && msg.data == "ArrowLeft" && ws.player) ws.player.dir = -5 * ws.player.mdir;
    if (msg.cmd == 'keydown' && msg.data == "ArrowRight" && ws.player) ws.player.dir = 5 * ws.player.mdir;
    if (msg.cmd == 'keyup' && ws.player) ws.player.dir = 0;
    if (msg.cmd == 'keydown' && msg.data == "Digit0") { ws.setPlayer(undefined)}
    if (msg.cmd == 'keydown' && msg.data == "Digit1") { ws.setPlayer(player1)}
    if (msg.cmd == 'keydown' && msg.data == "Digit2") { ws.setPlayer(player2)}
  });
  ws.on('close', function() {
    ws.setPlayer(undefined);
    users.delete(ws);
  });
  ws.setPlayer = function(id) {
    if (ws.player) ws.player.active = false;
    if (id == undefined) {
      ws.player = undefined;
      ws.send(JSON.stringify({msg: "id", data: ""}));
    }  else if (ws.player != id && id.active == false) {
      ws.player = id;
      player1.point = 0;
      player2.point = 0;
      id.active = true;
      ws.send(JSON.stringify({msg: "id", data: id.name}));
    }
  }
});

function sendAll(message) {
  users.forEach((val, key) => {key.send(message);})
}

function generateBall() {
  let ball = {x: 400, y: 350, vx: Math.random() * Math.round(Math.random() * 2) - 1, vy: Math.random() * Math.round(Math.random() * 2) - 1};
  let scale = 5 / Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
  ball.vx *= scale;
  ball.vy *= scale;
  return ball;
}

render();
function render(){
  setTimeout(render, 15);
  if(users.size == 0) return;
  if (Math.abs(ball.vx) < 0.5) ball.vx = 0.5;
  player1.y   = player1.y + player1.dir;
  player2.y   = player2.y + player2.dir;
  ball.x      = ball.x + ball.vx;
  ball.y      = ball.y + ball.vy;
  if (ball.y < 0 || ball.y > 600) ball.vy = -ball.vy;
  if (ball.x > player2.x) {
    if (ball.y < player2.y - player2.len || ball.y > player2.y + player2.len) {
        ball = generateBall();
        player1.point++;
    } else {
        ball.vy = ball.vy + (ball.y - player2.y) * 0.1;
        ball.vx = ball.vx * -1.01;
    }
  }
  if (ball.x < player1.x) {
    if (ball.y < player1.y - player1.len || ball.y > player1.y + player1.len) {
      ball = generateBall();
      player2.point++;
    } else {
      ball.vy = ball.vy + (ball.y - player1.y) * 0.1;
      ball.vx = ball.vx * -1.01;
    }
  }
  sendAll(JSON.stringify({msg:"update", data: {ball, player1, player2}}));
}