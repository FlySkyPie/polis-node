// import fs from 'fs-extra';  // ^11.2.0
import * as THREE from 'three'; // ^0.167.1
import { init, addThreeHelpers } from '3d-core-raub'; // ^4.3.0

const { doc, gl, requestAnimationFrame, } = init({
  isGles3: true,
  width: 400,
  height: 300,
  title: "OwO",
});
addThreeHelpers(THREE, gl);

const renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, });
renderer.setPixelRatio(doc.devicePixelRatio);
renderer.setSize(doc.innerWidth, doc.innerHeight);

const camera = new THREE.PerspectiveCamera(70, doc.innerWidth / doc.innerHeight, 1, 1000);
camera.position.z = 2;
camera.aspect = doc.innerWidth / doc.innerHeight;
camera.updateProjectionMatrix();

const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xFACE8D });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

let i = 0;

const animate = () => {
  requestAnimationFrame(animate);
  const time = Date.now();
  mesh.rotation.x = time * 0.0005;
  mesh.rotation.y = time * 0.001;

  renderer.render(scene, camera);

  const image: any = new Uint8Array(doc.w * doc.h * 4);

  gl.readPixels(
    0, 0,
    doc.w, doc.h,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image);

  // fs.ensureDirSync("./data");
  // fs.writeFileSync(`./data/${String(i).padStart(5, "0")}.rgba`, image, {});
  i++;
};

animate();

console.log("Test")
