var fs = require('fs');
const StringDecoder = require('string_decoder').StringDecoder;


// responseStlFile function reads local stl file and returns its content 
// in http response (200 or 404 http response code if were something errors with 
// file)
exports.responseFile = function(fPath, urlPath, response, cType, replaceMacros) {
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
