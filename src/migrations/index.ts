import * as migration_20260713_020430 from './20260713_020430';

export const migrations = [
  {
    up: migration_20260713_020430.up,
    down: migration_20260713_020430.down,
    name: '20260713_020430'
  },
];
