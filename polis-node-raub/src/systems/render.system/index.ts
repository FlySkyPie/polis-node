import type { Document } from '3d-core-raub';
import { LinearSRGBColorSpace, NoToneMapping, WebGLRenderer } from "three";

import type { ISystem } from "../../interfaces/system.interface";

export class RenderSystem implements ISystem {
    /**
     * @todo Change it to private after finished ECS migration.
     */
    public renderer: WebGLRenderer;

    constructor(doc: Document) {
        const renderer = new WebGLRenderer({
            antialias: false,
            alpha: false,
            depth: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: false,
        });
        renderer.shadowMap.autoUpdate = false;
        renderer.outputColorSpace = LinearSRGBColorSpace;
        renderer.toneMapping = NoToneMapping;
        renderer.setPixelRatio(doc.devicePixelRatio);
        renderer.setSize(doc.innerWidth, doc.innerHeight);

        this.renderer = renderer;
    }

    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    tick(world: unknown, queries: unknown): void {
        throw new Error("Method not implemented.");
    }

    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};