const express = require('express');
const app = express();
var expressWs = require('express-ws')(app);

app.use(express.static('public'));
app.listen(80);

app.ws('/', function(ws, req) {
   ws.on('message', function(msg) {
     console.log(msg);
   });
   console.log('socket', req.testing);
 });