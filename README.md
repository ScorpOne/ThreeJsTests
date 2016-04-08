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
    

Then you'll open /ThreeJs/threeJsTest.html in your browser and you'll see 3D cube from mesh.stl.


P.S 
(temporary) /NodeJs/nodeFileUploader.js - test js script with file uploader functionality.
/form.html - simple html form that can upload files, using nodeFileUploader script.

Added stl samples in stlSamples dir.
