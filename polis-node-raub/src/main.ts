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

const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  debugClockSystem.tick(world, {});
  renderSystem.tick(world);

  const { buffer, renderTarget: { width, height } } = querySpectator.first!;
  sharp(buffer, {
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

  i++;
};

gameLoop();

const broadcastor = new StreamBroadcastor(stream);
const server = new SpectatorServer(broadcastor);

broadcastor.setAnswerable(server);
