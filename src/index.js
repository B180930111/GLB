import * as THREE from "three";

// import { TweenMax } from "gsap";
import OrbitControls from "three-orbitcontrols";
// import { BasicShadowMap } from "three";
import GLTFLoader from "three-gltf-loader";
import { DoubleSide } from "three";

// console.log("OrbitControls", OrbitControls);

const backgroundColor = 0x000000;

const colors = [
  "rgb(255, 0, 0)",
  "rgb(255, 0, 255)",
  "rgb(255, 225, 0)",
  "rgb(255, 0, 255)",
  "rgb(0, 255, 255)",
  "rgb(0, 255, 0)"
];

const TRAY = document.getElementById("js-tray-slide");

/*////////////////////////////////////////*/

let renderCalls = [];
function render() {
  requestAnimationFrame(render);
  renderCalls.forEach((callback) => {
    callback();
  });
}
render();

// /*////////////////////////////////////////*/

let scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f1f1);
scene.fog = new THREE.Fog(0xf1f1f1, 20, 100);

let canvas = document.querySelector("#canvas");

let camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  800
);

camera.position.set(0, 5, 5);
// camera.position.y = 10;
// console.log(camera.position);

let renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(backgroundColor); //0x );

renderer.toneMapping = THREE.LinearToneMapping;
renderer.toneMappingExposure = Math.pow(0.94, 5.0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

window.addEventListener(
  "resize",
  function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

document.body.appendChild(renderer.domElement);

function renderScene() {
  renderer.render(scene, camera);
}
renderCalls.push(renderScene);

// /* ////////////////////////////////////////////////////////////////////////// */

let controls = new OrbitControls(camera, renderer.domElement);

controls.rotateSpeed = 0.3;
controls.zoomSpeed = 0.9;

controls.minDistance = 3;
controls.maxDistance = 5;

controls.minPolarAngle = Math.PI / 2; // radians
controls.maxPolarAngle = Math.PI / 3; // radians

controls.enableDamping = true;
controls.dampingFactor = 0.05;

renderCalls.push(function () {
  controls.update();
});

// /* ////////////////////////////////////////////////////////////////////////// */

let lightDirect = new THREE.DirectionalLight(0xffffff, 0.54);
lightDirect.position.set(-3, 5, 8);
lightDirect.pneumbra = 1;
lightDirect.castShadow = true;
lightDirect.shadow.camera.near = 3;
lightDirect.shadow.camera.far = 30;
lightDirect.shadow.mapSize.width = 1024;
lightDirect.shadow.mapSize.height = 1024;
scene.add(lightDirect);

// let light2 = new THREE.AmbientLight(0x404040, 1);
// light2.position.set(30, -10, 30);
// scene.add(light2);

const light = new THREE.HemisphereLight(0xffffff, 0xbebec5, 1);
light.position.set(0, 5, 0);
scene.add(light);
////////////////////////////////////////////////////
// const geometry = new THREE.BoxBufferGeometry(2, 2, 2);
// const material = new THREE.MeshPhongMaterial({ color: 0x49ef4 });
// let mesh = new THREE.Mesh(geometry, material);
// mesh.castShadow = true;
// mesh.receiveShadow = true;
// mesh.position.set(1, 1, 1);
// scene.add(mesh);

// /* ////////////////////////////////////////////////////////////////////////// */
const INITIAL_MTL = new THREE.MeshPhongMaterial(0xf1f1f1, { shininess: 10 });

const INITIAL_MAP = [
  { childID: "back", mtl: INITIAL_MTL },
  { childID: "base", mtl: INITIAL_MTL },
  { childID: "cushions", mtl: INITIAL_MTL },
  { childID: "legs", mtl: INITIAL_MTL },
  { childID: "supports", mtl: INITIAL_MTL }
];

// /* ////////////////////////////////////////////////////////////////////////// */
let loader = new GLTFLoader();
loader.crossOrigin = true;
loader.load(
  "../chair.glb",
  //"https://s3-us-west-2.amazonaws.com/s.cdpn.io/39255/ladybug.gltf",
  function (gltf) {
    let object = gltf.scene;
    object.traverse((e) => {
      if (e.isMesh === true) {
        e.castShadow = true;
        e.recieveShadow = true;
      }
    });
    object.scale.set(2, 2, 2);
    object.position.set(0, -1, 0);
    object.rotation.y = Math.PI;

    for (let obj of INITIAL_MAP) {
      initColor(object, obj.childID, obj.mtl);
    }

    scene.add(object);
  }
);
//////////////////////////////////////////
let initColor = (parent, type, mtl) => {
  parent.traverse((o) => {
    if (o.isMesh === true) {
      if (o.name.includes(type)) {
        o.material = mtl;
        o.nameID = type;
      }
    }
  });
};

/////////////////////////////////////////
const floorGeom = new THREE.PlaneBufferGeometry(1000, 1000, 30);

const floorMat = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 2
  // side: DoubleSide
});

const floorMesh = new THREE.Mesh(floorGeom, floorMat);
floorMesh.receiveShadow = true;
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = -1;
floorMesh.recieveShadow = true;

scene.add(floorMesh);
////////////////////////////////////////
function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement("div");
    swatch.classList.add("tray__swatch");

    swatch.style.background = "#" + color.color;

    swatch.setAttribute("data-key", i);
    TRAY.append(swatch);
  }
}

buildColors(colors);
