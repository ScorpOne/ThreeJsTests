var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');

var storePath = "c:\\tmp";
var urlDefault = "/";
var urlUpload = "/upload";


// checkFileExist function - just check is file exists or isn't
// return true/false
function checkFileExist(fName) {
    var ret = false;
    try {
      var fStat = fs.statSync(fName);	
      if (fStat.isFile) {
        ret = true;
      }
    }
    catch (excp) {}
    return ret;	
}


// renameFiles function - renames uploaded files in local storage
// from temporary hash names to real file's names
function renameFiles(files) {
    for (var key in files) {
      console.log('>>> [key is] ' + key);
      console.log('>>> [path is] ' + files[key]);
      var targetFile = storePath + '\\' + key;

      if (checkFileExist(files[key])) {
        if (checkFileExist(targetFile)) {
          fs.unlinkSync(targetFile);
        }
        fs.renameSync(files[key], targetFile);
      }
    }
}


// defaultHandler function - prepares and returns http response
// for default http request (request with hosts root url)
// will be implemented
function defaultHandler(request, response) {
}

// uploadHandler function - processes and save uploaded files
// also prepares and returns http response 
function uploadHandler(request, response) {
    var filesDict = {};
    var form = new multiparty.Form({'uploadDir': storePath});
      
    form.on('part', function (part) {
      console.log('>>> [part]');
    });

    form.on('file', function (name, file) {
      console.log('>>> [file] ' + file.originalFilename );
      console.log('>>> [file] ' + file.path);
      console.log('>>> [file] ' + file.headers);
      console.log('>>> [file] ' + file.size);
      console.log('>>> [file] ' + file.data);
      filesDict[file.originalFilename] = file.path;
    });

    form.on('field', function (name, value) {
      console.log('>>> [field]' + name);
    });


    form.on('close', function () {
      renameFiles(filesDict);
      console.log('>>> [close] ---------------------------------');
      response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
      response.end('>>> POST closed');
    });
    form.parse(request);
}

// main server method / requests income point
http.createServer(function(request, response) {
    console.log('>>> method is ' + request.method + ' ' + request.url);
    if(request.method == 'POST') {

      if (request.url == urlUpload) {
        uploadHandler(request, response);
      }
      else if (request.url == urlDafault) {
        defaultHandler(request, response);
      }

    } else {
        response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
        response.end('>>> Not POST method !!!');
    }

}).listen(8124);
