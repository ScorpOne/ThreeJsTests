const http = require('http');
const fs = require('fs');

http.createServer( (request, response) => {
  var fPath = 'C:\\tmp\\stls\\'
  console.log('>>> request income ' + fPath + request.url);
  try {
    console.log('>>> file ' + fs.accessSync(fPath + request.url, fs.R_OK));
    fBuff = fs.readFileSync(fPath + request.url);
    response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end(fBuff);
  }
  catch (excp) {
    var errString = '>>> fAccess error :' + excp
    console.log(errString)
    response.writeHead(404);
    response.end(errString);
  }
  
}).listen(8124);

console.log('Server running at http://127.0.0.1:8124/');
