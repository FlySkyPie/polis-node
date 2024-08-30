import type { Mesh, Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderTarget } from "three";
import type { IBMFont } from "load-bmfont";

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

export interface ISpectatorEntity {
  camera: PerspectiveCamera,
  renderTarget: WebGLRenderTarget,
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
  IThreeEntity
>;
