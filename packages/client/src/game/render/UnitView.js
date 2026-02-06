import { UNIT_ROLES } from '@autobattle/sim';

const ROLE_STYLE_MAP = {
  [UNIT_ROLES.TANK]: {
    shape: 'rectangle',
    label: 'Tank',
  },
  [UNIT_ROLES.HEALER]: {
    shape: 'triangle',
    label: 'Healer',
  },
  [UNIT_ROLES.DPS]: {
    shape: 'diamond',
    label: 'DPS',
  },
  [UNIT_ROLES.SUPPORT]: {
    shape: 'circle',
    label: 'Support',
    hasOutline: true,
  },
};

const UNKNOWN_ROLE_STYLE = {
  shape: 'circle',
  label: 'Unknown',
};


const missingRoleStyles = Object.values(UNIT_ROLES).filter((role) => !ROLE_STYLE_MAP[role]);
if (missingRoleStyles.length > 0) {
  console.warn(`[UnitView] Missing role styles for: ${missingRoleStyles.join(', ')}`);
}

function resolveRoleStyle(role) {
  const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
  const roleStyle = ROLE_STYLE_MAP[normalizedRole];

  if (!roleStyle) {
    console.warn(`[UnitView] Unknown unit role "${String(role)}". Falling back to Unknown style.`);
    return UNKNOWN_ROLE_STYLE;
  }

  return roleStyle;
}

function createBodyForRole(scene, unit, color, roleStyle) {
  const { x, y } = unit;
  const extraGraphics = [];
  let body;

  switch (roleStyle.shape) {
    case 'rectangle':
      body = scene.add.rectangle(x, y, 30, 30, color).setOrigin(0.5);
      break;
    case 'diamond':
      body = scene.add.polygon(x, y, [0, -18, 18, 0, 0, 18, -18, 0], color).setOrigin(0.5);
      break;
    case 'triangle':
      body = scene.add.polygon(x, y, [0, -18, 18, 14, -18, 14], color).setOrigin(0.5);
      break;
    case 'circle':
    default:
      body = scene.add.circle(x, y, 16, color);
      break;
  }

  if (roleStyle.hasOutline) {
    const outline = scene.add.circle(x, y, 19, 0x000000, 0).setStrokeStyle(2, 0xf8fafc, 0.95);
    extraGraphics.push(outline);
  }

  return { body, extraGraphics };
}

export class UnitView {
  constructor(scene, unit) {
    this.scene = scene;
    this.unitId = unit.id;
    const color = unit.teamId === 'A' ? 0x38bdf8 : 0xf87171;
    this.roleStyle = resolveRoleStyle(unit.role);

    const { body, extraGraphics } = createBodyForRole(scene, unit, color, this.roleStyle);
    this.body = body;
    this.extraGraphics = extraGraphics;

    this.roleLabel = scene
      .add.text(unit.x, unit.y + 24, this.roleStyle.label, {
        fontSize: '11px',
        color: '#e5e7eb',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    this.hpBg = scene.add.rectangle(unit.x, unit.y - 24, 36, 5, 0x111827).setOrigin(0.5);
    this.hpBar = scene.add.rectangle(unit.x - 18, unit.y - 24, 36, 5, 0x22c55e).setOrigin(0, 0.5);
  }

  update(unit) {
    this.body.setPosition(unit.x, unit.y);
    const currentAlpha = unit.alive ? 1 : 0.25;
    this.body.setAlpha(currentAlpha);

    this.extraGraphics.forEach((graphic) => {
      graphic.setPosition(unit.x, unit.y);
      graphic.setAlpha(currentAlpha);
    });

    this.roleLabel.setPosition(unit.x, unit.y + 24);
    this.roleLabel.setAlpha(unit.alive ? 0.95 : 0.4);

    this.hpBg.setPosition(unit.x, unit.y - 24);
    this.hpBar.setPosition(unit.x - 18, unit.y - 24);
    this.hpBar.width = 36 * (unit.hp / Math.max(1, unit.maxHp));
  }

  destroy() {
    this.body.destroy();
    this.extraGraphics.forEach((graphic) => graphic.destroy());
    this.roleLabel.destroy();
    this.hpBg.destroy();
    this.hpBar.destroy();
  }
}
