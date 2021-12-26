const { randomUUID } = require('crypto');
var static = require('node-static');
const http = require('http');
const https = require('https');
const wssServer = require('https').createServer;
const fs = require('fs');
var WebSocketServer = require('ws').Server;

var file = new(static.Server)(__dirname);

http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(8080);

const options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./fullchain.pem')
};

https.createServer(options, (req, res) => {
  file.serve(req, res);
}).listen(8081);

const server = wssServer(options);
server.listen(3000);

const idMap = new Map();
let ball                = {x: 300, y: 300, vx:   1              , vy: 5};
let racket              = {x: 200, y: 700, len:  50     , dir:  0};
let racket2             = {x: 200, y: 100, len:  50     , dir:  0};
let point      = [0, 0];
const  wss = new WebSocketServer({server: server});

wss.on('connection', function(ws) {
   ws.uuid = randomUUID();
   idMap.set(ws.uuid, ws);
   let res = {msg:"pos", data: idMap.size}
   ws.send(JSON.stringify(res));
   if (idMap.size == 1) ws.racket = racket;
   if (idMap.size == 2) ws.racket = racket2;
   console.log(idMap.size);
   ws.on('message', function(message) {
      let msg = JSON.parse(message);
      if(msg.cmd == 'keydown' && msg.data == "ArrowLeft" && ws.racket) ws.racket.dir = -5;
      if(msg.cmd == 'keydown' && msg.data == "ArrowRight" && ws.racket) ws.racket.dir = 5;
      if(msg.cmd == 'keyup' && ws.racket) ws.racket.dir = 0;
      ws.send(JSON.stringify({msg: "id", data:JSON.stringify(ws.uuid)}));
   });
   ws.on('close', function() {
      idMap.delete(ws.uuid);
   });
});

function sendAll(message) {
   idMap.forEach((val, key) => {
     val.send(message);
   })
}
render();
function render(){ 
   racket.x    = racket.x + racket.dir;
   racket2.x   = racket2.x + racket2.dir;
   ball.x      = ball.x + ball.vx;
   ball.y      = ball.y + ball.vy;
   if (ball.x < 0 || ball.x > 600) ball.vx = -ball.vx;
   if (ball.y < racket2.y) {
      if (ball.x < racket2.x - racket2.len || ball.x > racket2.x + racket2.len) {
          ball = {x:   300      , y:    300     , vx:   1               , vy: -5};
          point[0] = 0;
      } else {
          ball.vx = ball.vx + (ball.x - racket2.x) * 0.1;
          ball.vy = ball.vy * -1.01;
          point[0]++;
      }
  }
  if (ball.y > racket.y) {
       if (ball.x < racket.x - racket.len || ball.x > racket.x + racket.len) {
           ball = {x:   300     , y:    300     , vx:   1               , vy: -5};
           point[1] = 0;
       } else {
           ball.vx = ball.vx + (ball.x - racket.x) * 0.1;
           ball.vy = ball.vy * -1.01;
           point[1]++;
       }
   }
   setTimeout(render, 15);
   sendAll(JSON.stringify({msg:"ball", data: ball}));
   sendAll(JSON.stringify({msg:"racket", data: racket}));
   sendAll(JSON.stringify({msg:"racket2", data: racket2}));
   sendAll(JSON.stringify({msg:"point", data: point}));
}