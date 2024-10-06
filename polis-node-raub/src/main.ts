import * as THREE from 'three';
import { init, addThreeHelpers } from '3d-core-raub';
import { nonstandard, MediaStream } from 'wrtc';
import { World } from "miniplex";

import type { IEntity, } from './entities';

import { RenderSystem } from './systems/render.system';
import { AssetSystem } from './systems/asset.system';
import { GenesisSystem } from './systems/genesis.system';
import { SampleSystem } from './systems/sample.system';
import { DebugClockSystem } from './systems/debug-clock.system';
import { PoolCleanSystem } from './systems/pool-clean-system';
import { SpectatorSystem } from './systems/spectator.system';

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

const genesisSystem = new GenesisSystem();
const assetSystem = new AssetSystem();
const sampleSystem = new SampleSystem();
const debugClockSystem = new DebugClockSystem();
const renderSystem = new RenderSystem(doc);
const spectatorSystem = new SpectatorSystem();
const poolCleanSystem = new PoolCleanSystem();

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
  poolCleanSystem,
  spectatorSystem,
].map(item => item.init(world)));
await debugClockSystem.init(world);

const gameLoop = () => {
  requestAnimationFrame(gameLoop);

  debugClockSystem.tick(world);
  spectatorSystem.tick(world);
  renderSystem.tick(world);

  poolCleanSystem.tick(world, {});
};

gameLoop();
