import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader} from 'three/addons/loaders/RGBELoader.js';
//import { ThreeMFLoader } from 'three/addons/loaders/ThreeMFLoader.js';

//generate 3D scene
const scene = new THREE.Scene();
console.log(scene);

// create camera
const camera = new THREE.PerspectiveCamera(
    45, // FOV angle
    window.innerWidth / window.innerHeight, // width height ratio
    1, // near, distance from the camera
    1000 // far, distance from the camera
);
camera.position.z = 5;
// camera.position.set(0,0,5)

// create object // Geometry + material ... texture?
/*
const cube = new THREE.BoxGeometry(1,1,1);
//material
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(cube, material);
scene.add(mesh);
*/
/*
const baseUrl = 'src/assets/texture/park'
const texture = new THREE.CubeTextureLoader().setPath(baseUrl).load([
    '.jpg',
    '.jpg',
    '.jpg',
    '.jpg',
    '.jpg',
    '.jpg',
]);
*/

//hdr
/*
const texture1 = new RGBELoader().load('/src/assets/hdr/city.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    //scene.backgound = texture
    scene.environment = texture1 //object to reflect the texture
})
    */

//set background - svg: texture
const backgroundTexture = new THREE.TextureLoader().load('/src/assets/texture/car_display.svg');
backgoundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
backgoundTexture.repeat.set(1,1)
scene.background = backgroundTexture;

const createLight = function() {
    // environment light, all around
    const ambientLight = new THREE.AmbientLight(0Xf7f8fc, 0.2)
    scene.add(ambientLight)
    const directionLight = new THREE.DirectionalLight(0Xf7f8fc, 1.0)
    directionLight.position.set(0,5,0)
    scene.add(directionLight)
     const direcionLightHelper = new THREE.DirectionalLightHelper(directionLight);
    scene.add(direcionLightHelper);
}
createLight();

const createCar = function() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/src/assets/su7.glb', function(gltf) {
        console.log(gltf);
        const model = gltf.scene;
        scene.add(model);
    });
}
createCar();

// present stage
const createFloor = function() {
    const geom = new THREE.CircleGeometry(10, 64);
    // material: pbr material, support reflection, 粗糙度，金属度，贴图
    // PBR need lighting
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0Xffffff),
        // one side render -> double side render
        side: THREE.DoubleSide
    })
    const floorMesh = new THREE.Mesh(geom, material);
    scene.add(floorMesh);
    floorMesh.rotation.x += 90 * Math.PI / 180;
    floorMesh.position.set(0, -0.2, 0);
}
createFloor();


// create renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight); // viewpoint: "papaer"
document.body.appendChild(renderer.domElement);

//auto position
window.addEventListener("resize", function() {
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix() // update camera projection matrix
    renderer.setSize(this.window.innerWidth, this.window.innerHeight)
})

// support 轨道控制器 obitcontrol is an event
const orbitControls = new OrbitControls(camera, renderer.domElement);
//
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

renderer.setAnimationLoop(function() {
    // radius: ANGLE * PI / 180
    //mesh.rotation.x += 0.02;
    //mesh.rotation.y += 0.02;
    //render
    renderer.render(scene, camera);
})
//render
//renderer.render(scene, camera);



