import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader} from 'three/addons/loaders/RGBELoader.js';
//import { ThreeMFLoader } from 'three/addons/loaders/ThreeMFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

let tween;
const colorTransition = function(material, colorString) {
    const startColor = { r: material.color.r, g: material.color.g, b: material.color.b };
    const tempColor = new THREE.Color(colorString);
    const endColor = { r: tempColor.r, g: tempColor.g, b: tempColor.b };
    
    console.log('起始颜色:', startColor);
    console.log('目标颜色:', endColor);
    
    tween = new TWEEN.Tween(startColor)
        .to(endColor, 600)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate((coords) => {
            console.log('当前颜色:', coords);
            material.color.setRGB(coords.r, coords.g, coords.b);
        })
        .start();
}
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

const texture1 = new RGBELoader().load('/src/assets/hdr/pine_picnic_4k.hdr', () => {
    texture1.mapping = THREE.EquirectangularReflectionMapping
    //scene.backgound = texture
    scene.environment = texture1 //object to reflect the texture
})


//set background - svg: texture
const backgroundTexture = new THREE.TextureLoader().load('/src/assets/texture/car_display.svg');
backgroundTexture.wrapS = backgroundTexture.wrapT = THREE.RepeatWrapping;
backgroundTexture.repeat.set(1,1)
scene.background = backgroundTexture;

let directionLight;
const createLight = function() {
    // environment light, all around
    const ambientLight = new THREE.AmbientLight(0Xf7f8fc, 0.2)
    scene.add(ambientLight)
    // directional light
    directionLight = new THREE.DirectionalLight(0Xf7f8fc, 1.0)
    //directionLight = new THREE.SpotLight(0Xf7f8fc, 1.0, 100, 60 * Math.PI / 180, 0.1, 10);
    // set light position
    directionLight.position.set(0,5,0)
    directionLight.castShadow = true;
    directionLight.shadow.radius = 10;
    // increase shadow quality
    directionLight.shadow.mapSize.set(512 * 4, 512 * 4);
    // add shadow bias, soft shadow
    directionLight.shadow.radius = 16;

    scene.add(directionLight)
    // add helper
    // const direcionLightHelper = new THREE.DirectionalLightHelper(directionLight);
    //scene.add(direcionLightHelper);
}
createLight();

let materials = [];
const createCar = function() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load('/src/assets/su7.glb', function(gltf) {
        //console.log(gltf);
        const model = gltf.scene;
        scene.add(model);
        // isObject3D is true, then it is a mesh, can set shadow
        model.traverse(function(child) {
            // if child is a mesh, then cast shadow and receive shadow
            // if (child.isMesh) 
            if(child instanceof THREE.Mesh) {
                materials.push(child.material);
                //console.log(materials);
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    });
}
createCar();

let floorMesh;
// present stage
const createFloor = function() {
    const aoMap = new THREE.TextureLoader().load('/src/assets/texture/ao.jpg');
    aoMap.wrapS = aoMap.wrapT = THREE.RepeatWrapping;
    aoMap.repeat.set(1,1);
    const geom = new THREE.CircleGeometry(20, 64);
    // material: pbr material, support reflection, 粗糙度，金属度，贴图
    // PBR need lighting
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0Xffffff),
        transparent: true,
        // one side render -> double side render
        side: THREE.DoubleSide,
        aoMap: aoMap
    })
    floorMesh = new THREE.Mesh(geom, material);
    scene.add(floorMesh);
    floorMesh.rotation.x -= 90 * Math.PI / 180;
    floorMesh.position.set(0, 0, 0);
    floorMesh.receiveShadow = true;
}
createFloor();

// change car color
// 1. collect all car material information
// 2. according to current color, change car(painting) material
const changeCarBodyColor = function(colorString) {
    const bodyName = 'Car_body';
    console.log(materials);
    const targetMaterial = materials.find(m=>m.name === bodyName);

    if(targetMaterial) {
        //targetMaterial.color.set(colorString);
        colorTransition(targetMaterial, colorString);
    }
}

function createColorSelector() {
    const colorButtons = document.querySelectorAll('.color-btn');
    console.log(colorButtons);
    colorButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            const computedStyle = window.getComputedStyle(event.target);
            const colorString = computedStyle.backgroundColor;
            console.log('选择的颜色:', colorString);
            changeCarBodyColor(colorString);
        });
    });
}
createColorSelector();

// add shadow
// 1. set lightging (enable shadow)
//directionLight.castShadow = true;
// 2. set floor receive shadow
//floorMesh.receiveShadow = true;
// 3. render support shadow 贴图（texture?）
// renderer.shadowMap.enabled = true;
// 4. set car cast shadow
//const car = scene.getObjectByName('car');
//car.castShadow = true;

// create renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight); // viewpoint: "paper"
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;

//auto position
window.addEventListener("resize", function() {
    camera.aspect = this.window.innerWidth / this.window.innerHeight;
    camera.updateProjectionMatrix() // update camera projection matrix
    renderer.setSize(this.window.innerWidth, this.window.innerHeight)
})

// support 轨道控制器 obitcontrol is an event
const orbitControls = new OrbitControls(camera, renderer.domElement);

orbitControls.enableZoom = false;
orbitControls.enablePan = false;
orbitControls.minPolarAngle = 80 * Math.PI / 180;
orbitControls.maxPolarAngle = 100 * Math.PI/ 180;


//
const axesHelper = new THREE.AxesHelper(10);
scene.add(axesHelper);

renderer.setAnimationLoop(function() {
    // radius: ANGLE * PI / 180
    //mesh.rotation.x += 0.02;
    //mesh.rotation.y += 0.02;

    // invoke tween 
    if(tween) {
        tween.update();
    }
    //render
    renderer.render(scene, camera);
})
//render
//renderer.render(scene, camera);



