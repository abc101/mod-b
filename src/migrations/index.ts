import * as migration_20260713_020430 from './20260713_020430';
import * as migration_20261030_231101_security_update from './20261030_231101_security_update';

export const migrations = [
  {
    up: migration_20260713_020430.up,
    down: migration_20260713_020430.down,
    name: '20260713_020430',
  },
  {
    up: migration_20261030_231101_security_update.up,
    down: migration_20261030_231101_security_update.down,
    name: '20261030_231101_security_update'
  },
];
