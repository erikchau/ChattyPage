var chatServer = require('./lib/chat_server')

var http = require('http'),
    static = require('node-static');

var file = new static.Server('./public');
var port = process.env.PORT || 8080;
var server = http.createServer(function (req, res) {
  req.addListener('end', function () {
    file.serve(req, res);
  }).resume();
});

server.listen(port);

chatServer.listen(server);