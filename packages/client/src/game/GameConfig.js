import { BootScene } from './scenes/BootScene.js';
import { MatchScene } from './scenes/MatchScene.js';
import { ResultScene } from './scenes/ResultScene.js';

export const GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: 'app',
  backgroundColor: '#10131a',
  scene: [BootScene, MatchScene, ResultScene]
};
