var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');
var urlParser = require('url');

var stlFPath = 'C:\\tmp\\stls\\'
var fileDefaultForm = "form.html";
var stringDefaultForm = "<!DOCTYPE html>\n<html>\n<\html>\n";
var storePath = "c:\\tmp\\";
var htmlFormsPath = "c:\\tmp\\";
var urlDefault = "/";
var urlUpload = "/upload";


// cTypeByExtResolver function - resolve cType by url extention
function cTypeByExtResolver(url) {
    var ret = "text/plain";
    var extDict = {".js": "application/javascript", ".html": "text/html", 
                   ".htm": "text/html", '.css': "text/css", ".stl": "stl"};
    for (key in extDict) {
      var pos = url.lastIndexOf(key);
      if (pos > 0 && pos == (url.length - key.length)) {
        ret = extDict[key];
        break;
      } 
    }
    return ret;
}


// checkFileExist function - just check is file exists or isn't
// return true/false
function checkFileExist(fName, accessMode) {
    var ret = false;
    try {
      var fStat = fs.statSync(fName);	
      if (fStat.isFile) {
        if (accessMode) {
          fs.accessSync(fName, accessMode);
          ret = true;
        }
        else {
          ret = true;
        }
      }
    }
    catch (excp) {}
    return ret;	
}


// renameFiles function - renames uploaded files in local storage
// from temporary hash names to real file's names
function renameFiles(files) {
    for (var key in files) {
      console.log(">>> [key is] " + key);
      console.log(">>> [path is] " + files[key]);
      var targetFile = storePath + key;

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
    response.writeHead(200, "OK", {"Content-Type": "text/html"});
    fs.readFile(htmlFormsPath + fileDefaultForm, "utf8", (err, data) => {
      if (err) {
        console.log(">>> ERR = " + err);
        response.end(stringDefaultForm);
      }
      else {
        response.end(data);
      }
    });
}

// uploadHandler function - processes and save uploaded files
// also prepares and returns http response 
function uploadHandler(request, response) {
    var filesDict = {};
    var lastFormFileName = "";
    var form = new multiparty.Form({"uploadDir": storePath});
      
    form.on("part", function (part) {
      console.log(">>> [part]");
    });

    form.on("file", function (name, file) {
      console.log(">>> [file] " + file.originalFilename );
      console.log(">>> [file] " + file.path);
      console.log(">>> [file] " + file.headers);
      console.log(">>> [file] " + file.size);
      console.log(">>> [file] " + file.data);
      filesDict[file.originalFilename] = file.path;
      lastFormFileName = file.originalFilename;
    });

    form.on("field", function (name, value) {
      console.log(">>> [field]" + name);
    });


    form.on("close", function () {
      var redirectLocation = "http://127.0.0.1:8124/stl_loader_own.html";
      if (lastFormFileName != "") {
        redirectLocation += "?stl=" + lastFormFileName;
      }
      renameFiles(filesDict);
      console.log(">>> [close] ---------------------------------");
      response.writeHead(301, "Moved Permanently", 
                         {"Location": redirectLocation});
      response.end("");
    });
    form.parse(request);
}


// responseStlFile function reads local stl file and returns its content 
// in http response (200 or 404 http response code if were something errors with 
// file)
function responseFile(urlPath, response, fPath, cType) {
    fs.readFile(fPath + urlPath, (err, data) => {
      if (err) {
        var errString = ">>> fAccess error :" + err
        console.log(errString)
        response.writeHead(404);
        response.end(errString);
      }
      else {
        console.log(">>> file = " + urlPath + " size = " + data.length);
        response.writeHead(200, "OK", {"Content-Type": cType});
        response.end(data);
      }
    });
}


// main server method / requests income point
http.createServer(function(request, response) {
    console.log(">>> method is " + request.method + ' ' + request.url);
    if(request.method == "POST") {

      if (request.url == urlUpload) {
        uploadHandler(request, response);
      }

    } else {
      if (request.url == urlDefault) {
        defaultHandler(request, response);
      }
      else { 
        urlObj = urlParser.parse(request.url, true);
        var urlPath = urlObj["pathname"];
        /*
        if ("query" in urlObj && "as" in urlObj["query"]) {
	  console.log(urlObj["query"]["as"]);
          console.log(urlObj["pathname"]);
        }
        */ 
        var cType = cTypeByExtResolver(urlPath);
        console.log(cType);
        if (cType == "stl") {
          responseFile(urlPath, response, stlFPath, "plain/text");
        }
        else if (["text/html", "application/javascript", "text/css"].indexOf(cType) >= 0) {
          responseFile(urlPath, response, htmlFormsPath, cType);
        }
        else {
          response.writeHead(200, "OK", {"Content-Type": "text/plain"});
          response.end(">>> Not POST method and not root url!!!");
        } 
      }
    }

}).listen(8124);
