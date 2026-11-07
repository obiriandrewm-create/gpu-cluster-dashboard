import { presetBigLib } from '@size-limit/preset-big-lib';
import { presetSmallLib } from '@size-limit/preset-small-lib';
import { defineConfig } from 'size-limit';

export default defineConfig([
  {
    name: 'Main bundle',
    pattern: 'dist/assets/index-*.js',
    limit: '150 kB',
    gzip: true,
    preset: presetSmallLib,
  },
  {
    name: 'Chart bundle',
    pattern: 'dist/assets/chart-*.js',
    limit: '80 kB',
    gzip: true,
    preset: presetBigLib,
  },
]);
