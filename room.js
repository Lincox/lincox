var colors = {
  orange: 0xff6651,
  white: 0xffffff,
  beige: 0xfff8d9,
  brown: 0x553111,
  green: 0x56b09e,
  red: 0xff0000,
};

var container;

var camera, scene, controls;

//Mouse picking (hover)
// var raycaster = new THREE.Raycaster();

var renderer;

var clock = new THREE.Clock();
var time = 0;
var duration = 100;
var keyframes = 4;
var interpolation = duration / keyframes;
var currentKeyframe = 0;
var lastKeyframe = 0;
var animOffset = 1;
var radius = 600;
var theta = 0;
var prevTime = Date.now();

var lamp_light, light, fakeLight;

var video, videoImage, videoImageContext, videoTexture;

var mouseX = 0,
  mouseY = 0;

var mesh, circle, controller_animation, helper;
var morph_logic;

var screen_mesh;
var texture1;
var ay = {
  ready: {
    count: 0
  },
  colors: {
    blank: 0xffffff
  },
  mouse: {
    x: 0,
    y: 0,
    z: 0.5
  },
  targetList: []
};


var baseMaterial = new THREE.MeshBasicMaterial({
  color: ay.colors.blank,
  // flatShading : THREE.FlatShading,
  // side: THREE.DoubleSide
  //map: couch_texture
});




//___________________________________________ KICK IT OFF
init();
animate();

//___________________________________________ INIT
function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 0;
  camera.move_direction = 1;
  scene = new THREE.Scene();
  scene.add(camera);


  //___________________________________________ CONTROLS
  controls = new THREE.OrbitControls(camera);
  controls.damping = 0.2;
  controls.addEventListener("change", render);
  // controls.maxPolarAngle = Math.PI / 2;
  camera.lookAt(new THREE.Vector3(0, 50, 0));
  controls.target = new THREE.Vector3(0, 50, 0);


  // RENDERER

  renderer = new THREE.WebGLRenderer({
    // smooth skin
    antialias: true,
    transparent: true,
    alpha: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  // renderer.shadowMapEnabled = true;


  //___________________________________________ Camera Driver

  var radius = 250;
  var segments = 32;

  var circleGeometry = new THREE.CircleGeometry(radius, segments);
  circle = new THREE.Mesh(circleGeometry);
  circle.add(camera);
  circle.visible = false;
  scene.add(circle);

  circle.update = function (time) {
    this.rotation.y += 0.003;
  };


  // createDust();
  // createLights();
  // createFloor();
  // createFrontWall();
  // createSideWall();
  // createBookShelf();
  // human();
  jump();

  const axesHelper = new THREE.AxesHelper(2)
  scene.add(axesHelper)

  ay.ready = true;
} // end of init

function clicker(obj) {
  obj.parent.ex_bool = true;
  obj.parent.children.forEach(function (el) {
    explosion = new Explode(el);
  });
}

//___________________________________________ Event in Space
document.addEventListener("mousedown", onDocumentMouseDown, false);
document.addEventListener("mousemove", onDocumentMouseMove, false);
window.addEventListener("resize", onWindowResize, false);
//___________________________________________ click

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseDown(event) {
  ay.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  ay.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // find intersections
  var vector = new THREE.Vector3(ay.mouse.x, ay.mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );
  var intersects = ray.intersectObjects(ay.targetList);
  if (intersects.length > 0) {
    clicker(intersects[0].object);
  }
}
//___________________________________________ move

function onDocumentMouseMove(event) {
  ay.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  ay.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // find intersections
  var vector = new THREE.Vector3(ay.mouse.x, ay.mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(
    camera.position,
    vector.sub(camera.position).normalize()
  );

  var intersects = ray.intersectObjects(ay.targetList);

  if (intersects.length > 0) {
    mover(intersects[0].object);
  }
  if (typeof morph_logic != "undefined") {
    morph_logic.loop_all_morphs(time);
  }
}

//___________________________________________ RENDER

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render(time) {
  // theta += 0.1;
  // var delta = 0.75 * clock.getDelta();

  // if (ay.ready) {
  //   circle.update(time);
  // }

  // // update morph

  // if (typeof animation !== "undefined") {
  //   var keyframe = Math.floor(time / interpolation) + animOffset;

  //   morph_logic.loop_all_morphs(time);

  //   THREE.AnimationHandler.update(delta / interpolation);

  //   var time = Date.now();
  //   prevTime = time;
  // }

  camera.lookAt(new THREE.Vector3(0, 20, 0));
  renderer.render(scene, camera);
}

var dusts,
    floor,
    frontWall,
    sideWall,
    bookshelf;

function createLights(){
  // Gradient color light=
  hemisphereLight = new THREE.HemisphereLight(0xffffff,0xf0f0f0, 1);

  // Parallel rays
  shadowLight = new THREE.DirectionalLight(0xffffff, .9);

  shadowLight.position.set(0,350,350);
  shadowLight.castShadow = true;

  // define the visible area of the projected shadow
  shadowLight.shadow.camera.left = -1050;
  shadowLight.shadow.camera.right = 650;
  shadowLight.shadow.camera.top = 650;
  shadowLight.shadow.camera.bottom = -650;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // Shadow map size
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // Add the lights to the scene
  scene.add(hemisphereLight);

  // scene.add(shadowLight);

  lampLight = new THREE.SpotLight(0xf0c043, 0.25);
  lampLight.position.set(-55, 50, -50).multiplyScalar(1);
  scene.add(lampLight);
  lampLight.target.position.set(-55, 0, -50);
  lampLight.target.updateMatrixWorld();

  blurLight = new THREE.SpotLight(0xfff2d1, 0.7);
  blurLight.position.set(-10, 0, -10);
  blurLight.penumbra = 1;
  scene.add(blurLight);
  blurLight.target.position.set(10, 10, 10);
  blurLight.target.updateMatrixWorld();

}

// Dust
function createDust() {
  let vertices = [];

  for ( let i = 0; i < 300; i ++ ) {

    let x = (Math.random() - 0.2) * Math.sin(i) * 300;
    let y = (Math.random() - 0.2) * Math.sin(i) * 300;
    let z = (Math.random() - 0.2) * Math.sin(i) * 300;

    vertices.push( x, y, z );

  }

  let dust = new THREE.BufferGeometry();
  dust.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

  let dustMaterial = new THREE.PointsMaterial( {
    color: 0xffffff,
    size: 4,
    transparent: true,
    opacity: 1,
  } );

  let dusts = new THREE.Points( dust, dustMaterial );

  scene.add(dusts);
}

// Floor
function createFloor() {
  let floorMat = new THREE.MeshPhongMaterial({
    color: colors.beige,
  });

  let tileMat = new THREE.MeshLambertMaterial({
    color: colors.brown,
  });

  let floorGeo = new THREE.BoxGeometry(150, 5, 150);
  floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.x = 7.3;
  floor.position.y = -20;
  floor.position.z = 0;
  floor.receiveShadow = true;
  floor.castShadow = true;

  scene.add(floor);

  let tiles = [];
  let tilesGeo = new THREE.BoxGeometry(150, 2, 14);

  for (let i = 0; i < 10; i++) {
    tiles[i] = new THREE.Mesh(tilesGeo, tileMat);
    tiles[i].position.x = 0;
    tiles[i].position.y = 4;
    tiles[i].position.z = 68 - i * 15;

    tiles[i].receiveShadow = true;
    tiles[i].castShadow = true;
    floor.add(tiles[i]);
  }
}

// Front Wall
function createFrontWall() {
  let frontWallMat = new THREE.MeshPhongMaterial({
    color: colors.orange,
  });

  let frontWallGeo = new THREE.BoxGeometry(150, 5, 150);
  frontWall = new THREE.Mesh(frontWallGeo, frontWallMat);
  frontWall.position.x = 80;
  frontWall.position.y = 60;
  frontWall.position.z = 0;
  frontWall.rotateX( Math.PI / 2 );
  frontWall.rotateZ( Math.PI / 2 );
  frontWall.receiveShadow = true;
  frontWall.castShadow = true;

  scene.add(frontWall);
}

// Side Wall
function createSideWall() {
  sideWall = frontWall.clone();
  sideWall.rotateZ( Math.PI / 2 );
  sideWall.position.z = -72.5;
  sideWall.position.x = 7.3;

  scene.add(sideWall);
}

// BookShelf
function createBookShelf() {
  let oneTheFloorPos = 15;

  bookshelf = new THREE.Object3D();
  let bookshelfGeo = new THREE.BoxGeometry(1.5, 78, 15);
  let bookshelfMat = new THREE.MeshPhongMaterial({
    color: colors.beige,
  });

  let bookshelfLeft = new THREE.Mesh(bookshelfGeo, bookshelfMat);

  bookshelfLeft.receiveShadow = true;
  bookshelfLeft.castShadow = true;

  bookshelfLeft.position.z = 0;
  bookshelfLeft.position.y = oneTheFloorPos;

  bookshelfRight = bookshelfLeft.clone();
  bookshelfRight.position.x = 32;

  bookshelf.add(bookshelfLeft);
  bookshelf.add(bookshelfRight);

  let bookshelfFloorGeo = new THREE.BoxGeometry(30, 1.5, 14);

  let shelf_floors = [];
  for (let f = 0; f < 7; f++) {
    shelf_floors[f] = new THREE.Mesh(bookshelfFloorGeo, bookshelfMat);

    shelf_floors[f].position.x = 16;
    shelf_floors[f].position.y = -22 + f * 12;
    shelf_floors[f].position.z = -0.5;
    shelf_floors[f].receiveShadow = true;
    shelf_floors[f].castShadow = true;
    bookshelf.add(shelf_floors[f]);
  }


  let books = [];
  let bookGeo = new THREE.BoxGeometry(2, 7.5, 10);
  let bookMat = new THREE.MeshPhongMaterial({
    color: colors.red,
  });
  let randomColors = ['0x072578', '0x03540d', '0x969102', '0x965602', '0x61003d'];

  let bookCount = 0;
  for (let r = 0; r < 6; r++) {
    for (let b = 0; b < 12; b++) {
      randomColor = new THREE.Color( parseInt (randomColors[Math.floor(Math.random() * randomColors.length)]) );
      bookMat = new THREE.MeshPhongMaterial({
        color: randomColor,
        flatShading: true,
      });

      books[bookCount] = new THREE.Mesh(bookGeo, bookMat);
      books[bookCount].position.x = 5 + b * 2.25;
      books[bookCount].position.y = -18 + r * 12;
      books[bookCount].position.z = Math.random() * 2.0;
      books[bookCount].rotation.y = Math.random() * 0.25;
      books[bookCount].rotation.z = Math.random() * 0.05;

      books[bookCount].receiveShadow = true;
      books[bookCount].castShadow = true;
      bookshelf.add(books[bookCount]);
      bookCount++;
    }
  }
  bookshelf.position.set(70, 10, -20);
  bookshelf.rotation.y = (90 * Math.PI) / 180;

  let second_shelf = bookshelf.clone();
  second_shelf.position.z = 15;
  scene.add(second_shelf);

  scene.add(bookshelf);
}

function human() {
  const loader = new THREE.GLTFLoader();

  // Optional: Provide a DRACOLoader instance to decode compressed mesh data
  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath( '/examples/js/libs/draco/' );
  // loader.setDRACOLoader( dracoLoader );

  // Load a glTF resource
  loader.load(
    // resource URL
    'objects/scene.gltf',
    // called when the resource is loaded
    function ( gltf ) {

      scene.add( gltf.scene );

      gltf.animations; // Array<THREE.AnimationClip>
      gltf.scene; // THREE.Group
      gltf.scenes; // Array<THREE.Group>
      gltf.cameras; // Array<THREE.Camera>
      gltf.asset; // Object

    },
    // called while loading is progressing
    function ( xhr ) {

      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

      console.log( 'An error happened' );

    }
  );
}

function jump() {
  const loader = new THREE.FBXLoader();
  loader.load( 'objects/jump.fbx', function ( object ) {
    scene.add( object );
  }, undefined, function ( e ) {
    console.error( e );
  } );
}
