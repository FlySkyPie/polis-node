// import * as THREE from 'three';
import type { Texture, } from 'three';
import { TextureLoader } from 'three';
import loadFont, { type IResult } from 'load-bmfont';

export const loadFontPromise = (fontPath: string) => new Promise<IResult>((resove, reject) => {
    loadFont(fontPath, (err, font) => {
        if (err) {
            reject(err);
            return;
        }
        resove(font);
    })
});

export const loadTexturePromise = (texturePath: string) => new Promise<Texture>((resove) => {
    const loader = new TextureLoader();
    const texture = loader.load(texturePath);

    resove(texture);
});