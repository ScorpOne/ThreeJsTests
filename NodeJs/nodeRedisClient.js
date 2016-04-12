var http = require('http');
var Redis = require('ioredis');
var urlParser = require('url');
var fs = require('fs');
var commonFunc = require('ownLib\\nodeCommonFunc.js');
redisConnection = new Redis(6377, '127.0.0.1');

var storePath = "c:\\tmp\\";

// main server method / requests income point
// Receive simple get requests with fName and fValue fields
// and makes simple set/get operations with Redis storage
http.createServer(function(request, response) {
    console.log(">>> method is " + request.method + " " + request.url);
    var resultString = ""; 
    var urlObj = urlParser.parse(request.url, true);      
    if ("pathname" in urlObj && urlObj["pathname"] == "/redis.html") {
      commonFunc.responseFile(storePath, "redis.html", response, "text/html");
    } else {

      if ("query" in urlObj && "fName" in urlObj["query"] && "fValue" in urlObj["query"]) {
        redisConnection.set(urlObj["query"]["fName"], urlObj["query"]["fValue"]);
        redisConnection.get(urlObj["query"]["fName"], function (err, result) {
          resultString = (">>> Ok; result is = " + result);
          console.log(resultString);
          response.writeHead(200, "OK", {"Content-Type": "text/HTML"});
          response.end("<html><body>%result%</body></html>".replace("%result%", resultString));
        });
      } else {
        resultString = ">>> Err; some mandatory params are empty ";
      }

      if (resultString != "") {
        response.writeHead(200, "OK", {"Content-Type": "text/HTML"});
        response.end("<html><body>%result%</body></html>".replace("%result%", resultString));
      }        
    }
}).listen(8124);
