declare module 'load-bmfont' {
    export interface IResult {
        pages: string[]
        chars: Char[]
        kernings: Kerning[]
        info: Info
        common: Common
    }

    export interface Char {
        id: number
        x: number
        y: number
        width: number
        height: number
        xoffset: number
        yoffset: number
        xadvance: number
        page: number
        chnl: number
    }

    export interface Kerning {
        first: number
        second: number
        amount: number
    }

    export interface Info {
        face: string
        size: number
        bold: number
        italic: number
        charset: string
        unicode: number
        stretchH: number
        smooth: number
        aa: number
        padding: number[]
        spacing: number[]
    }

    export interface Common {
        lineHeight: number
        base: number
        scaleW: number
        scaleH: number
        pages: number
        packed: number
        alphaChnl: number
        redChnl: number
        greenChnl: number
        blueChnl: number
    }

    type ILoadFontCallboack = (error: Error | null, result: IResult) => void;

    function loadFont(opt: any, cb: ILoadFontCallboack): void;

    export default loadFont;
};
