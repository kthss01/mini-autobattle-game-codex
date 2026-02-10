import Phaser from 'phaser';
import { CHAMPIONS } from '@autobattle/sim';
import { createRandomSeed, parseSeedInput } from '../utils/seed';
import { createDefaultMatchSetup, TEAM_SIZE } from '../types/MatchSetup';
import { selectPositionInfo } from '../selectors/positionInfo';

const SPRITE_SHEET_FRAME_WIDTH = 128;
const SPRITE_SHEET_FRAME_HEIGHT = 192;
const SPRITE_SHEET_COLUMNS = 8;
const SPRITE_SHEET_ROWS = 8;
const SPRITE_SHEET_CONFIG = {
  frameWidth: SPRITE_SHEET_FRAME_WIDTH,
  frameHeight: SPRITE_SHEET_FRAME_HEIGHT
};
const TRANSPARENCY_KEY_COLOR_THRESHOLD = 248;

// Champion sheets follow a 1024x1536 layout: 8 columns x 8 rows at 128x192 per frame.
const CHAMPION_SPRITE_BASE_PATH = `${resolveBaseUrl()}assets/sprites`;
const SPRITE_PATH_FALLBACK_BY_CHAMPION_ID = Object.freeze({
  // 임프 전용 시트가 아직 없어서 임시로 소환사 시트를 재사용합니다.
  imp_minion: 'summoner_witch'
});

function resolveChampionSpritePath(champion) {
  const spriteSourceId = SPRITE_PATH_FALLBACK_BY_CHAMPION_ID[champion.id] ?? champion.id;
  return `${CHAMPION_SPRITE_BASE_PATH}/${spriteSourceId}.png`;
}

function resolveBaseUrl() {
  const base = typeof import.meta !== 'undefined' ? import.meta?.env?.BASE_URL : './';
  if (!base) return './';
  return base.endsWith('/') ? base : `${base}/`;
}

function isDevelopmentMode() {
  return typeof import.meta !== 'undefined' && import.meta?.env?.DEV;
}

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const baseUrl = resolveBaseUrl();
    const championSpriteByKey = new Map(CHAMPIONS.map((champion) => [champion.spriteKey, champion]));

    if (isDevelopmentMode()) {
      console.info(`[BootScene] import.meta.env.BASE_URL = "${baseUrl}"`);
      this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
        const champion = championSpriteByKey.get(file?.key);
        if (!champion) return;

        console.warn(
          `[BootScene] Failed to load champion sprite sheet: key="${file.key}", id="${champion.id}", src="${file.src}".`
        );
      });
    }

    CHAMPIONS.forEach((champion) => {
      const spritePath = resolveChampionSpritePath(champion);
      this.load.spritesheet(champion.spriteKey, spritePath, SPRITE_SHEET_CONFIG);
    });
  }

  create() {
    this.rebuildOpaqueChampionSheetsWithTransparency();

    this.slotAssignments = CHAMPIONS.slice(0, TEAM_SIZE).map((champion, slotIndex) => ({
      slotIndex,
      championId: champion.id
    }));
    this.selectedSlotIndex = 0;

    this.createStartMenuOverlay();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroyStartMenuOverlay());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.destroyStartMenuOverlay());
  }

  rebuildOpaqueChampionSheetsWithTransparency() {
    CHAMPIONS.forEach((champion) => {
      const textureKey = champion.spriteKey;
      if (!this.textures.exists(textureKey)) return;

      const sourceImage = this.textures.get(textureKey)?.getSourceImage();
      if (!sourceImage) return;

      const hasPixelAlpha = this.detectPixelTransparency(sourceImage);
      if (hasPixelAlpha) return;

      const rebuiltTexture = this.textures.createCanvas(`${textureKey}-chroma`, sourceImage.width, sourceImage.height);
      const context = rebuiltTexture.getContext();
      context.clearRect(0, 0, sourceImage.width, sourceImage.height);
      context.drawImage(sourceImage, 0, 0);

      const imageData = context.getImageData(0, 0, sourceImage.width, sourceImage.height);
      const pixels = imageData.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        if (
          red >= TRANSPARENCY_KEY_COLOR_THRESHOLD &&
          green >= TRANSPARENCY_KEY_COLOR_THRESHOLD &&
          blue >= TRANSPARENCY_KEY_COLOR_THRESHOLD
        ) {
          pixels[index + 3] = 0;
        }
      }

      context.putImageData(imageData, 0, 0);
      rebuiltTexture.refresh();

      this.textures.remove(textureKey);
      this.textures.renameTexture(`${textureKey}-chroma`, textureKey);

      for (let row = 0; row < SPRITE_SHEET_ROWS; row += 1) {
        for (let col = 0; col < SPRITE_SHEET_COLUMNS; col += 1) {
          const frameIndex = row * SPRITE_SHEET_COLUMNS + col;
          this.textures.get(textureKey).add(
            frameIndex,
            0,
            col * SPRITE_SHEET_FRAME_WIDTH,
            row * SPRITE_SHEET_FRAME_HEIGHT,
            SPRITE_SHEET_FRAME_WIDTH,
            SPRITE_SHEET_FRAME_HEIGHT
          );
        }
      }
    });
  }

  detectPixelTransparency(sourceImage) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sourceImage.width;
    tempCanvas.height = sourceImage.height;
    const context = tempCanvas.getContext('2d', { willReadFrequently: true });
    if (!context) return false;

    context.drawImage(sourceImage, 0, 0);
    const pixels = context.getImageData(0, 0, sourceImage.width, sourceImage.height).data;
    for (let index = 3; index < pixels.length; index += 4) {
      if (pixels[index] < 255) return true;
    }

    return false;
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

    const slotsWrapper = document.createElement('div');
    slotsWrapper.style.display = 'flex';
    slotsWrapper.style.flexDirection = 'column';
    slotsWrapper.style.gap = '6px';
    slotsWrapper.style.marginTop = '4px';

    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.textContent = 'Start';
    startButton.style.padding = '6px 10px';
    startButton.style.cursor = 'pointer';

    const message = document.createElement('span');
    message.style.color = '#fca5a5';
    message.style.fontSize = '12px';
    message.style.minHeight = '16px';

    const positionPanel = this.createPositionInfoPanel(appRoot);

    const refreshPositionPanel = () => {
      const slot = this.slotAssignments[this.selectedSlotIndex] ?? { slotIndex: this.selectedSlotIndex };
      const info = selectPositionInfo({ slot });
      this.renderPositionInfo(positionPanel, info);
    };

    const renderSlots = () => {
      slotsWrapper.replaceChildren();

      this.slotAssignments.forEach((slot) => {
        const row = document.createElement('label');
        row.style.display = 'flex';
        row.style.gap = '8px';
        row.style.alignItems = 'center';
        row.style.padding = '6px';
        row.style.borderRadius = '6px';
        row.style.background = slot.slotIndex === this.selectedSlotIndex ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255,255,255,0.04)';
        row.style.border = slot.slotIndex === this.selectedSlotIndex ? '1px solid #60a5fa' : '1px solid transparent';
        row.style.cursor = 'pointer';

        const slotLabel = document.createElement('span');
        slotLabel.style.color = '#e5e7eb';
        slotLabel.style.minWidth = '62px';
        slotLabel.textContent = `Slot ${slot.slotIndex + 1}`;

        const select = document.createElement('select');
        select.style.padding = '4px 6px';
        select.style.flex = '1';
        CHAMPIONS.forEach((champion) => {
          const option = document.createElement('option');
          option.value = champion.id;
          option.textContent = champion.name;
          option.selected = champion.id === slot.championId;
          select.appendChild(option);
        });

        row.addEventListener('click', () => {
          this.selectedSlotIndex = slot.slotIndex;
          renderSlots();
          refreshPositionPanel();
        });

        select.addEventListener('click', (event) => event.stopPropagation());
        select.addEventListener('change', (event) => {
          slot.championId = event.target.value;
          this.selectedSlotIndex = slot.slotIndex;
          renderSlots();
          refreshPositionPanel();
        });

        row.appendChild(slotLabel);
        row.appendChild(select);
        slotsWrapper.appendChild(row);
      });
    };

    const startMatch = () => {
      const parsed = parseSeedInput(input.value);
      if (!parsed.ok) {
        message.textContent = parsed.message;
        return;
      }

      message.textContent = '';
      const teamAChampionIds = this.slotAssignments.map((slot) => slot.championId);
      const payload = createDefaultMatchSetup(parsed.seed, [...teamAChampionIds, ...CHAMPIONS.slice(TEAM_SIZE).map((champion) => champion.id)]);
      payload.teams.A.slots = this.slotAssignments.map((slot) => ({ ...slot }));
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
    wrapper.appendChild(slotsWrapper);
    wrapper.appendChild(startButton);
    wrapper.appendChild(message);

    appRoot.appendChild(wrapper);

    this.startMenuOverlay = wrapper;
    this.positionInfoPanel = positionPanel;

    renderSlots();
    refreshPositionPanel();
  }

  createPositionInfoPanel(appRoot) {
    const panel = document.createElement('div');
    panel.style.position = 'absolute';
    panel.style.right = '20px';
    panel.style.top = '20px';
    panel.style.width = '300px';
    panel.style.padding = '12px';
    panel.style.background = 'rgba(17, 24, 39, 0.9)';
    panel.style.border = '1px solid #4b5563';
    panel.style.borderRadius = '8px';
    panel.style.color = '#f9fafb';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '6px';
    panel.style.zIndex = '10';

    appRoot.appendChild(panel);
    return panel;
  }

  renderPositionInfo(panel, info) {
    panel.replaceChildren();

    const heading = document.createElement('strong');
    heading.textContent = `Slot ${info.position + 1} · ${info.positionLabel}`;

    const recommended = document.createElement('div');
    recommended.textContent = `추천 역할: ${info.recommendedRoles.join(', ')}`;

    const assigned = document.createElement('div');
    assigned.textContent = info.assignedChampion
      ? `배정 챔피언: ${info.assignedChampion.name} (${info.assignedChampion.role})`
      : '배정 챔피언: 없음';

    const stats = document.createElement('div');
    stats.textContent = info.coreStats
      ? `핵심 스탯 - HP ${info.coreStats.hp} / 공격 ${info.coreStats.attack} / 사거리 ${info.coreStats.range} / 공속 ${info.coreStats.attackSpeed}`
      : '핵심 스탯: 챔피언 배정 필요';

    const skills = document.createElement('div');
    skills.textContent = `스킬: ${info.skillSummary}`;

    panel.appendChild(heading);
    panel.appendChild(recommended);
    panel.appendChild(assigned);
    panel.appendChild(stats);
    panel.appendChild(skills);
  }

  destroyStartMenuOverlay() {
    if (this.startMenuOverlay) {
      this.startMenuOverlay.remove();
      this.startMenuOverlay = null;
    }

    if (this.positionInfoPanel) {
      this.positionInfoPanel.remove();
      this.positionInfoPanel = null;
    }
  }
}
