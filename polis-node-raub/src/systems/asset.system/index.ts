import type { World } from "miniplex";
import path from 'path';

import type { ISystem } from "../../interfaces/system.interface";
import type { IEntity, IFontAssetEntity, ITextureAssetEntity } from "../../entities";
import { loadFontPromise, loadTexturePromise } from "../../utilities/load";

export class AssetSystem implements ISystem {
    async init(world: World<IEntity>) {
        const [font, texture] = await Promise.all([
            loadFontPromise(path.resolve(__dirname, './assets/Simple.fnt')),
            loadTexturePromise(path.resolve(__dirname, './assets/Simple.png')),
        ])

        world.add<IFontAssetEntity>({
            name: 'BasicFont',
            font,
        });

        world.add<ITextureAssetEntity>({
            name: 'BasicFontTexture',
            texture,
        });
    }

    tick(_world: unknown, _queries: unknown): void {
        throw new Error("Method not implemented.");
    }

    dispose(): Promise<void> {
        throw new Error("Method not implemented.");
    }
};
