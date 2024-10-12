import build from "@vercel/ncc";
import path from 'path';
import fs from 'fs-extra';
import { replaceInFile } from 'replace-in-file'

const { code, assets } = await build(path.resolve(__dirname, './src/main.ts'), {
    sourceMap: true,
})

Object.entries(assets).forEach(async ([key, value]) => {
    const filename = path.resolve(__dirname, "dist/", key);
    await fs.ensureFile(filename);
    await fs.writeFile(filename, (value as any).source);
});

const entryFilename = path.resolve(__dirname, "dist/", "index.js");
await fs.ensureFile(entryFilename);
await fs.writeFile(entryFilename, code);

// Post process due to limitation ncc handle path inside `3d-core-raub`.
await replaceInFile({
    files: entryFilename,
    from: /__dirname/g,
    to: '"."',
});
