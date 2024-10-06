import type {
  Mesh, Object3D, PerspectiveCamera, Scene, Spherical, Texture, WebGLRenderTarget
} from "three";
import type { IBMFont } from "load-bmfont";
import type { RTCVideoSource } from "wrtc/lib/binding";

import type { IEvent } from "./event.interface";

/**
 * Singleton component for Three.js.
 */
export interface IThreeComponent {
  scene: Scene;
}

/**
 * Singleton entity for Three.js.
 */
export interface IThreeSingletonEntity {
  threeComponent: IThreeComponent;
  // debugClockComponent: Mesh;
}

export interface IThreeEntity {
  object3D: Object3D;
}

export interface IDebugClockEntity extends IThreeEntity {
  isDebugClock: true;
  mesh: Mesh;
}


export interface IEventEntity {
  eventQueue: unknown[];
  events: unknown[];
};

export interface IControlState {
  forward: 'forward' | 'backward' | null;
  sidemove: 'right' | 'left' | null;
  spherical: Spherical;
}

export interface ISpectatorEntity {
  id: string;

  /**
   * Provide viewport of the spectator.
   */
  camera: PerspectiveCamera,

  /**
   * Provide GL context to render viewport of the spectator.
   */
  renderTarget: WebGLRenderTarget,

  /**
   * Store pixels of rendered viewport.
   */
  // buffer: Uint8Array,

  /**
   * Used to stream viewport to client.
   */
  source: RTCVideoSource,

  controller: IControlState;
};

export interface IFontAssetEntity {
  name: string;
  font: IBMFont;
};

export interface ITextureAssetEntity {
  name: string;
  texture: Texture;
};


export type IEntity = Partial<
  ISpectatorEntity &
  ITextureAssetEntity &
  IEventEntity &
  IFontAssetEntity &
  IThreeSingletonEntity &
  IDebugClockEntity &
  IThreeEntity &
  IEvent
>;
