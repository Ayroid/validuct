import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  outfile: 'dist/server.js',
  external: [
    // Native modules that can't be bundled
    'bcrypt',
    // Prisma runtime needs to be external
    '@prisma/client/runtime/*',
  ],
  banner: {
    js: `
import { createRequire as _createRequire } from 'module';
import { fileURLToPath as _fileURLToPath } from 'url';
import _path from 'path';
const require = _createRequire(import.meta.url);
const __filename = _fileURLToPath(import.meta.url);
const __dirname = _path.dirname(__filename);
`,
  },
});

console.log('Production build complete: dist/server.js');
