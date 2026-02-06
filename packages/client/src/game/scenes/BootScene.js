import Phaser from 'phaser';
import { CHAMPIONS } from '@autobattle/sim';
import { createRandomSeed, parseSeedInput } from '../utils/seed';
import { createDefaultMatchSetup } from '../types/MatchSetup';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createStartMenuOverlay();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyStartMenuOverlay());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyStartMenuOverlay());
  }

  createStartMenuOverlay() {
    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '20px';
    wrapper.style.top = '20px';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '8px';
    wrapper.style.padding = '12px';
    wrapper.style.background = 'rgba(17, 24, 39, 0.9)';
    wrapper.style.border = '1px solid #4b5563';
    wrapper.style.borderRadius = '8px';
    wrapper.style.zIndex = '10';

    const title = document.createElement('div');
    title.textContent = 'Start Match';
    title.style.color = '#f9fafb';
    title.style.fontSize = '18px';

    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.gap = '8px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter seed (integer >= 0)';
    input.style.width = '240px';
    input.style.padding = '6px 8px';

    const randomButton = document.createElement('button');
    randomButton.type = 'button';
    randomButton.textContent = 'Random Seed';
    randomButton.style.padding = '6px 10px';
    randomButton.style.cursor = 'pointer';

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.textContent = 'Start';
    startButton.style.padding = '6px 10px';
    startButton.style.cursor = 'pointer';

    const message = document.createElement('span');
    message.style.color = '#fca5a5';
    message.style.fontSize = '12px';
    message.style.minHeight = '16px';

    const startMatch = () => {
      const parsed = parseSeedInput(input.value);
      if (!parsed.ok) {
        message.textContent = parsed.message;
        return;
      }

      message.textContent = '';
      const payload = createDefaultMatchSetup(
        parsed.seed,
        CHAMPIONS.map((champion) => champion.id)
      );
      this.scene.start('MatchScene', payload);
    };

    randomButton.addEventListener('click', () => {
      const randomSeed = createRandomSeed();
      input.value = String(randomSeed);
      message.textContent = '';
    });

    startButton.addEventListener('click', startMatch);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') startMatch();
    });

    inputRow.appendChild(input);
    inputRow.appendChild(randomButton);

    wrapper.appendChild(title);
    wrapper.appendChild(inputRow);
    wrapper.appendChild(startButton);
    wrapper.appendChild(message);

    appRoot.appendChild(wrapper);

    this.startMenuOverlay = wrapper;
  }

  destroyStartMenuOverlay() {
    if (!this.startMenuOverlay) return;
    this.startMenuOverlay.remove();
    this.startMenuOverlay = null;
  }
}
