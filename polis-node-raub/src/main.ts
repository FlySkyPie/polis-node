import path from 'path';
import * as THREE from 'three';
import { init, addThreeHelpers } from '3d-core-raub';
import { nonstandard, MediaStream } from 'wrtc';
import createText from '@flyskypie/three-bmfont-text';
import dayjs from 'dayjs';
import sharp from 'sharp';

import { StreamBroadcastor } from './stream-broadcastor';
import { SpectatorServer } from './spectator-server';
import { loadFontPromise, loadTexturePromise } from './utilities/load';

const { doc, gl, requestAnimationFrame, } = init({
  isGles3: true,
  isWebGL2: true,
  width: 400,
  height: 300,
  title: "OwO",
  isVisible: false,
});
addThreeHelpers(THREE, gl);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: false,
  depth: false,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
});
renderer.shadowMap.autoUpdate = false;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;
renderer.setPixelRatio(doc.devicePixelRatio);
renderer.setSize(doc.innerWidth, doc.innerHeight);

const renderTarget = new THREE.WebGLRenderTarget(500, 500, {
  depthBuffer: false,
});

const camera = new THREE.PerspectiveCamera(70, doc.innerWidth / doc.innerHeight, 1, 1000);
camera.position.z = 15;
camera.aspect = doc.innerWidth / doc.innerHeight;
camera.updateProjectionMatrix();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xFACE8D });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// helper
scene.add(new THREE.AxesHelper(20));

const size = 20;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
gridHelper.rotateX(Math.PI * 0.5)
scene.add(gridHelper);

const [font, texture] = await Promise.all([
  loadFontPromise(path.resolve(__dirname, './assets/Simple.fnt')),
  loadTexturePromise(path.resolve(__dirname, './assets/Simple.png')),
]);

const textMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  transparent: true,
  color: 'rgb(230, 230, 230)'
});
const geom: THREE.BufferGeometry = createText({
  text: dayjs().format('HH:mm:ss SSS'), // the string to render
  font: font, // the bitmap font definition
  width: 1000, // optional width for word-wrap
});
const text = new THREE.Mesh(geom, textMaterial);

// scale it down so it fits in our 3D units
var textAnchor = new THREE.Object3D();
textAnchor.scale.set(0.05, -0.05, -0.05);
textAnchor.position.setX(-1000 * 0.05 * 0.5 * 0.5)
textAnchor.add(text);
scene.add(textAnchor);

let i = 0;

const source = new nonstandard.RTCVideoSource();
const track = source.createTrack();
const stream = new MediaStream()
stream.addTrack(track)

const animate = () => {
  requestAnimationFrame(animate);
  const time = Date.now();
  mesh.rotation.x = time * 0.0005;
  mesh.rotation.y = time * 0.001;

  const geom: THREE.BufferGeometry = createText({
    text: dayjs().format('HH:mm:ss SSS'), // the string to render
    font: font, // the bitmap font definition
    width: 1000, // optional width for word-wrap
  });

  const old = text.geometry;
  text.geometry = geom;
  old.dispose();

  renderer.render(scene, camera);

  // const image: any = new Uint8ClampedArray(doc.w * doc.h * 4);
  // gl.readPixels(
  //   0, 0,
  //   doc.w, doc.h,
  //   gl.RGBA,
  //   gl.UNSIGNED_BYTE,
  //   image);

  renderer.setRenderTarget(renderTarget);
  renderer.render(scene, camera);

  const image: any = new Uint8Array(renderTarget.width * renderTarget.height * 4);

  renderer.readRenderTargetPixels(
    renderTarget,
    0, 0,
    renderTarget.width, renderTarget.height,
    image);

  sharp(image, {
    raw: {
      width: renderTarget.width,
      height: renderTarget.height,
      channels: 4,
    }
  }).flip()
    .toBuffer()
    .then(buffer => {
      const i420Data = new Uint8ClampedArray(renderTarget.width * renderTarget.height * 1.5);
      const i420Frame = { width: renderTarget.width, height: renderTarget.height, data: i420Data };
      const rgbaFrame = { width: renderTarget.width, height: renderTarget.height, data: buffer };

      nonstandard.rgbaToI420(rgbaFrame, i420Frame);

      source.onFrame(i420Frame);
    });

  renderer.setRenderTarget(null);
  i++;
};

animate();

const broadcastor = new StreamBroadcastor(stream);
const server = new SpectatorServer(broadcastor);

broadcastor.setAnswerable(server);
