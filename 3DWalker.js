
"use strict";

window.onload = () => {
  let canvas = document.getElementById('webgl');
  let positon_text = document.getElementById('position');
  let lookat_text = document.getElementById('lookat');
  // let timestamp_text = document.getElementById('timestamp');
  canvas.setAttribute("width", 500);
  canvas.setAttribute("height", 500);
  window.ratio = canvas.width / canvas.height;
  let gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Load a new scene
  new SceneLoader(gl, positon_text, lookat_text).init();
};

class SceneLoader {
  constructor(gl, positon_text, lookat_text) {
    this.gl = gl;
    this.position_text = positon_text;
    this.lookat_text = lookat_text;
    this.loaders = [];
    this.keyboardController = new KeyboardController();
  }

  init() {

    this.initKeyController();

    this.initLoaders();

    let render = (timestamp) => {
      this.initWebGL();

      this.initCamera(timestamp);

      for (let loader of this.loaders) {
        
        loader.render(timestamp);
      }
      
      // console.log(Camera.light);
      //CubeRes
      render_CubeRes();

      requestAnimationFrame(render, this.gl);
    };

    render();
  }


  initWebGL() {
    // Set clear color and enable hidden surface removal
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear color and depth buffer
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  initKeyController() {
    Camera.init();
    let cameraMap = new Map();
    cameraMap.set('a', 'posLeft');
    cameraMap.set('d', 'posRight');
    cameraMap.set('w', 'posUp');
    cameraMap.set('s', 'posDown');
    cameraMap.set('j', 'rotLeft');
    cameraMap.set('l', 'rotRight');
    cameraMap.set('i', 'rotUp');
    cameraMap.set('k', 'rotDown');
    cameraMap.set('f', 'lightSwitch');
    cameraMap.forEach((val, key)=> {
          
            this.keyboardController.bind(key, {
              on: ((key)=> {
                if(key=='f'){
                  Camera.light = (!Camera.light);
                  // console.log("press f");
                }else{
                  Camera.state[val] = 1;
                }
                
              }),
              off: (()=> {
                Camera.state[val] = 0;
              })
            });
          
          
        }
    )
  }

  initCamera(timestamp) {
    let elapsed = timestamp - this.keyboardController.last;
    this.keyboardController.last = timestamp;

    let posY = (Camera.state.posRight - Camera.state.posLeft) * MOVE_VELOCITY * elapsed / 1000;
    let posW = (Camera.state.posUp - Camera.state.posDown) * MOVE_VELOCITY * elapsed / 1000;
    let rotY = (Camera.state.rotRight - Camera.state.rotLeft) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;
    let rotW = (Camera.state.rotUp - Camera.state.rotDown) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

    if (posY) Camera.move(0, posY, this.position_text, this.lookat_text);
    if (posW) Camera.move(posW, 0, this.position_text, this.lookat_text);
    if (rotY) Camera.rotate(0, rotY, this.position_text, this.lookat_text);
    if (rotW) Camera.rotate(rotW, 0, this.position_text, this.lookat_text);
  }

  initLoaders() {
    // Load floor
    let floorLoader = new TextureLoader(floorRes, {
      'gl': this.gl,
      'activeTextureIndex': 0,
      'enableLight': true
    }).init("floor.jpg");
    this.loaders.push(floorLoader);

    //Load cubeRes
    // main_CubeRes();

    // Load box
    let boxLoader = new TextureLoader(boxRes, {
      'gl': this.gl,
      'activeTextureIndex': 1,
      'enableLight': true
    }).init("boxface.bmp");
    this.loaders.push(boxLoader);

        // Load objects
    for (let o of ObjectList) {

      // Add animation to bird
      if (o.objFilePath.indexOf('bird') > 0) {
        // o.transform[0] = {type: "translate", content: [5, 1, -10]};
      }
      let loader = new ObjectLoader(o, {'gl': this.gl}).init();
      
      this.loaders.push(loader);
    }
  }
}