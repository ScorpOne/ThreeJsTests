# ThreeJsTests
threejs test scripts.

 Script run requirements:
 
 1) Root script's path/dir now harcoded as c:\tmp.
    So all items from GIT:ThreeJs/ dir (+ThreeJs lib as c:\tmp\threeJs) must be located in c:\tmp.
 
 2) ThreeJs lib (https://github.com/mrdoob/three.js/archive/master.zip) 
    must be delopyed in script's (c:\tmp\threeJs\threeJsTest.html) directory.
    
 3) NodeJs must be started with /NodeJs/nodeFileUploader.js script.
 3.1) 127.0.0.1:8124 port must be available.
 
 4) Test stl source file (mesh.stl) must be loacated on Node.js host machine 
    by path: (c:\tmp\stls\mesh.stl)
    
Then you can:
-Open http://127.0.0.1:8124/threeJsTest.html?stl=mesh.stl in your browser and you'll see 3D cube from mesh.stl.
OR
-Open upload form by : http://127.0.0.1:8124/.


P.S 
(temporary) /NodeJs/nodeFileUploader.js - test js script with file uploader functionality.
/form.html - simple html form that can upload files, using nodeFileUploader script.

Added stl samples in stlSamples dir.

11.04.2016 Updated.
 Updated with simple token registration.
 Now work with script starts by http://127.0.0.1:8124/index.html page. http://127.0.0.1:8124/ page will redirect to the 
 registration.html page.

12.04.2016 Updated.
 Added next script file into the nodeJs scripts:
 ./nodeCimmonFunc.js - will contain common user functions.
 ./nodeTokenCalc.js - simple method for token generating/calculating.
 ./nodeRedisClient.js - node js server script which services set/get requests to the Redis storage.
