import path from 'path';
import * as THREE from 'three';
import { init, addThreeHelpers } from '3d-core-raub';
import { nonstandard, MediaStream } from 'wrtc';
import loadFont, { type IResult } from 'load-bmfont';
import createText from '@flyskypie/three-bmfont-text';
import dayjs from 'dayjs';

import { StreamBroadcastor } from './stream-broadcastor';
import { SpectatorServer } from './spectator-server';

export const loadFontPromise = (fontPath: string) => new Promise<IResult>((resove, reject) => {
  loadFont(fontPath, (err, font) => {
    if (err) {
      reject(err);
      return;
    }
    resove(font);
  })
});

export const loadTexturePromise = (texturePath: string) => new Promise<THREE.Texture>((resove) => {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(texturePath);

  resove(texture);
});

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
camera.position.z = 15;
camera.aspect = doc.innerWidth / doc.innerHeight;
camera.updateProjectionMatrix();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0xFACE8D });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// helper
scene.add(new THREE.AxesHelper(20));

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

  const image: any = new Uint8ClampedArray(doc.w * doc.h * 4);

  gl.readPixels(
    0, 0,
    doc.w, doc.h,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image);

  const i420Data = new Uint8ClampedArray(doc.w * doc.h * 1.5);
  const i420Frame = { width: doc.w, height: doc.h, data: i420Data };
  const rgbaFrame = { width: doc.w, height: doc.h, data: image };

  nonstandard.rgbaToI420(rgbaFrame, i420Frame);

  source.onFrame(i420Frame);
  // fs.ensureDirSync("./data");
  // fs.writeFileSync(`./data/${String(i).padStart(5, "0")}.rgba`, image, {});
  i++;
};

animate();

const broadcastor = new StreamBroadcastor(stream);
const server = new SpectatorServer(broadcastor);

broadcastor.setAnswerable(server);
