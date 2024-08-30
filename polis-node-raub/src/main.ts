import * as THREE from 'three';
import { init, addThreeHelpers } from '3d-core-raub';
import { nonstandard, MediaStream } from 'wrtc';
import sharp from 'sharp';
import { World } from "miniplex";

import type { IEntity, } from './entities';

import { StreamBroadcastor } from './stream-broadcastor';
import { SpectatorServer } from './spectator-server';
import { RenderSystem } from './systems/render.system';
import { AssetSystem } from './systems/asset.system';
import { GenesisSystem } from './systems/genesis.system';
import { SampleSystem } from './systems/sample.system';
import { DebugClockSystem } from './systems/debug-clock.system';

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
const queryThree = world.with('threeComponent');

const genesisSystem = new GenesisSystem();
const assetSystem = new AssetSystem();
const sampleSystem = new SampleSystem();
const debugClockSystem = new DebugClockSystem();
const renderSystem = new RenderSystem(doc);

// const systems = [
//   genesisSystem,
//   assetSystem,
//   sampleSystem,
//   debugClockSystem,
//   renderSystem,
// ];

await genesisSystem.init(world);
await Promise.all([
  assetSystem,
  sampleSystem,
  renderSystem,
].map(item => item.init(world)));
await debugClockSystem.init(world);

let i = 0;

//@ts-ignore
const source = new nonstandard.RTCVideoSource();
const track = source.createTrack();
const stream = new MediaStream()
stream.addTrack(track)

const animate = () => {
  requestAnimationFrame(animate);

  debugClockSystem.tick(world, {});

  // renderSystem.renderer.render(scene, camera);

  // const image: any = new Uint8ClampedArray(doc.w * doc.h * 4);
  // gl.readPixels(
  //   0, 0,
  //   doc.w, doc.h,
  //   gl.RGBA,
  //   gl.UNSIGNED_BYTE,
  //   image);


  (() => {
    const { threeComponent: { scene } } = queryThree.first!;

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
