import path from 'path';
import * as THREE from 'three';
import { init, addThreeHelpers } from '3d-core-raub';
import { nonstandard, MediaStream } from 'wrtc';
import createText from '@flyskypie/three-bmfont-text';
import dayjs from 'dayjs';
import sharp from 'sharp';
import { World } from "miniplex";

import type {
  IThreeEntity, ISpectatorEntity, IEntity,
  ITextureAssetEntity, IFontAssetEntity, IDebugClockEntity,
} from './entities';

import { StreamBroadcastor } from './stream-broadcastor';
import { SpectatorServer } from './spectator-server';
import { loadFontPromise, loadTexturePromise } from './utilities/load';
import { RenderSystem } from './systems/render.system';

const { doc, gl, requestAnimationFrame, } = init({
  isGles3: true,
  isWebGL2: true,
  width: 400,
  height: 300,
  title: "OwO",
  isVisible: false,
});
addThreeHelpers(THREE, gl);

const world = new World<IEntity>();

const querySpectator = world.with('camera', 'renderTarget');
const queryFont = world.with('name', 'font');
const queryFontTexture = world.with('name', 'texture');
const queryDebugClock = world.with('object3D', 'mesh', 'isDebugClock');

world.add<ISpectatorEntity>((() => {
  const camera = new THREE.PerspectiveCamera(70, 1, 1, 1000);
  camera.position.z = 25;

  const renderTarget = new THREE.WebGLRenderTarget(500, 500, {
    depthBuffer: false,
  });

  return { camera, renderTarget };
})());

const renderSystem = new RenderSystem(doc);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

await Promise.all([
  loadFontPromise(path.resolve(__dirname, './assets/Simple.fnt')),
  loadTexturePromise(path.resolve(__dirname, './assets/Simple.png')),
]).then(([font, texture]) => {
  world.add<IFontAssetEntity>({
    name: 'BasicFont',
    font,
  });

  world.add<ITextureAssetEntity>({
    name: 'BasicFontTexture',
    texture,
  });
});

const objectEntities: IThreeEntity[] = [{
  object3D: new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshBasicMaterial({ color: 0xFACE8D })),
}, {
  object3D: new THREE.AxesHelper(20),
}, {
  object3D: (() => {
    const size = 20;
    const divisions = 10;
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.rotateX(Math.PI * 0.5);

    return gridHelper;
  })(),
}];

for (const { object3D } of objectEntities) {
  scene.add(object3D);
}

world.add<IDebugClockEntity>((() => {
  const material = new THREE.MeshBasicMaterial({
    map: queryFontTexture.first!.texture,
    transparent: true,
    color: 'rgb(230, 230, 230)'
  });
  const geometry: THREE.BufferGeometry = createText({
    text: dayjs().format('HH:mm:ss SSS'),
    font: queryFont.first!.font,
    width: 1000,
  });
  const mesh = new THREE.Mesh(geometry, material);

  // scale it down so it fits in our 3D units
  const textAnchor = new THREE.Object3D();
  textAnchor.scale.set(0.05, -0.05, -0.05);
  textAnchor.position.setX(-1000 * 0.05 * 0.5 * 0.5)
  textAnchor.add(mesh);
  scene.add(textAnchor);

  return {
    isDebugClock: true,
    mesh: mesh,
    object3D: textAnchor,
  };
})());

let i = 0;

//@ts-ignore
const source = new nonstandard.RTCVideoSource();
const track = source.createTrack();
const stream = new MediaStream()
stream.addTrack(track)

const animate = () => {
  requestAnimationFrame(animate);

  const geom: THREE.BufferGeometry = createText({
    text: dayjs().format('HH:mm:ss SSS'),
    font: queryFont.first!.font,
    width: 1000,
  });

  const { mesh: text } = queryDebugClock.first!;
  const old = text.geometry;
  text.geometry = geom;
  old.dispose();

  // renderSystem.renderer.render(scene, camera);

  // const image: any = new Uint8ClampedArray(doc.w * doc.h * 4);
  // gl.readPixels(
  //   0, 0,
  //   doc.w, doc.h,
  //   gl.RGBA,
  //   gl.UNSIGNED_BYTE,
  //   image);


  (() => {
    const spectatorEntity = querySpectator.first!;
    const { renderTarget, camera } = spectatorEntity;
    const { width, height } = renderTarget;
    renderSystem.renderer.setRenderTarget(renderTarget);
    renderSystem.renderer.render(scene, camera);

    const image: any = new Uint8Array(width * height * 4);

    renderSystem.renderer.readRenderTargetPixels(
      renderTarget,
      0, 0,
      width, height,
      image);

    sharp(image, {
      raw: {
        width: width,
        height: height,
        channels: 4,
      }
    }).flip()
      .toBuffer()
      .then(buffer => {
        const i420Data = new Uint8ClampedArray(width * height * 1.5);
        const i420Frame = { width: width, height: height, data: i420Data };
        const rgbaFrame = { width: width, height: height, data: buffer };

        nonstandard.rgbaToI420(rgbaFrame, i420Frame);

        source.onFrame(i420Frame);
      });
  })();

  renderSystem.renderer.setRenderTarget(null);
  i++;
};

animate();

const broadcastor = new StreamBroadcastor(stream);
const server = new SpectatorServer(broadcastor);

broadcastor.setAnswerable(server);
