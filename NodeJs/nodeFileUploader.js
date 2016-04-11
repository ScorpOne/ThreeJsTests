var http = require('http');
var multiparty = require('multiparty');
var fs = require('fs');
var urlParser = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


var stlFPath = 'C:\\tmp\\stls\\'
var fileDefaultForm = "form.html";
var stringDefaultForm = "<!DOCTYPE html>\n<html>\n<\html>\n";
var storePath = "c:\\tmp\\";
var htmlFormsPath = "c:\\tmp\\";
var registrationFileName = "registration.html";
var urlDefault = "/";
var urlUpload = "/upload";


// cTypeByExtResolver function - resolve cType by url extention
function cTypeByExtResolver(url) {
    var ret = "text/plain";
    var extDict = {".js": "application/javascript", ".html": "text/html", 
                   ".htm": "text/html", '.css': "text/css", ".stl": "stl"};
    for (var key in extDict) {
      var pos = url.lastIndexOf(key);
      if (pos >= 0 && pos == (url.length - key.length)) {
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
      //console.log(">>> [key is] " + key);
      //console.log(">>> [path is] " + files[key]);
      var targetFile = stlFPath + key;

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
        //console.log(">>> ERR = " + err);
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
    //console.log(">>> data is " + request.post);
    var form = new multiparty.Form({"uploadDir": stlFPath});
      
    form.on("part", function (part) {
      //console.log(">>> [part]");
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
      var redirectLocation = "http://127.0.0.1:8124/threeJsTest.html";
      if (lastFormFileName != "") {
        redirectLocation += "?stl=" + lastFormFileName;
      }
      var urlObj = urlParser.parse(request.url, true);
      if ("query" in urlObj && "token" in urlObj["query"]) {
        redirectLocation += ("&token=" + urlObj["query"]["token"]);
      }

      renameFiles(filesDict);
      console.log(">>> [close] ---------------------------------");
      response.writeHead(301, "Moved Permanently", {"Location": redirectLocation});
      response.end("");
    });
    form.parse(request);
}


// responseStlFile function reads local stl file and returns its content 
// in http response (200 or 404 http response code if were something errors with 
// file)
function responseFile(urlPath, response, fPath, cType, replaceMacros) {
    fs.readFile(fPath + urlPath, (err, data) => {
      if (err) {
        var errString = ">>> fAccess error :" + err
        //console.log(errString)
        response.writeHead(404);
        response.end(errString);
      }
      else {
        //console.log(">>> file = " + urlPath + " size = " + data.length);
        if (replaceMacros) {
          try {
            const decoder = new StringDecoder('utf8');
            var strData = decoder.write(data);

            for (var key in replaceMacros) {
              strData = strData.replace(new RegExp(key.replace(/[-\/\\^$*+?.()|[\]{}]/g,"g")), 
                                        replaceMacros[key]);
            }
            data = strData;
          }
          catch (err) {
          } 
        }
        response.writeHead(200, "OK", {"Content-Type": cType});
        response.end(data);
      }
    });
}


// checkToken function checks "token" urls param for some urls which
// pathname finished by substrings from tokenUrlPathes list
function checkToken(url, urlObj) {
    var ret = true;
    var tokenUrlPathes = [urlDefault, urlUpload, ".html", ".htm", ".stl"];
    if (!urlObj) {
      urlObj = urlParser.parse(url, true);
    } 
    var urlPath = urlObj["pathname"];

    for (var i=0; i < tokenUrlPathes.length; i++) {
      var pos = urlPath.lastIndexOf(tokenUrlPathes[i]);
      //console.log(">>> token pos = " + pos);
      if (pos >= 0 && pos == (urlPath.length - tokenUrlPathes[i].length)) {
        if (!("query" in urlObj && "token" in urlObj["query"])) {
          ret = false;
        }
        break;
      } 
    }
    console.log(">>> check token result = " + ret);
    return ret;
}


// newTokenGeneration fuction generates and returns new token
function newTokenGeneration(request) {
  return "ABC";
}



// sendRegistrationForm fuction feturns redirect to registration form with
// calculated fresh token
function sendRegistrationForm(newToken, response) {
  console.log(">>> send registration !!! ");
  var redirectLocation = "/registration.html?token=" + newToken;
  response.writeHead(301, "Moved Permanently", {"Location": redirectLocation});
  response.end(""); 
}


// main server method / requests income point
http.createServer(function(request, response) {
    console.log(">>> method is " + request.method + ' ' + request.url);
    var urlObj = urlParser.parse(request.url, true);
    var urlPath = urlObj["pathname"];

    if (checkToken(request.url, urlObj)) {
      console.log(">>> TRUE !!! ");
      if(request.method == "POST") {

        if (urlPath == urlUpload) {
          uploadHandler(request, response);
        }

      } else {
        if (urlPath == urlDefault) {
          defaultHandler(request, response);
        }
        else { 
          var cType = cTypeByExtResolver(urlPath);
          console.log(cType);
          if (cType == "stl") {
            responseFile(urlPath, response, stlFPath, "application/octet-stream");
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
    } else {
      sendRegistrationForm(newTokenGeneration(request), response);
    }

}).listen(8124);
