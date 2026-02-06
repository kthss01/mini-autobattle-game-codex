export function distance2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function distance(a, b) {
  return Math.sqrt(distance2(a, b));
}

export function isAlive(unit) {
  return unit && unit.alive && unit.hp > 0;
}

export function inRange(unit, target, range) {
  return distance2(unit, target) <= range * range;
}

export function moveTowards(unit, target, dt) {
  const dx = target.x - unit.x;
  const dy = target.y - unit.y;
  const len = Math.hypot(dx, dy) || 1;
  const step = unit.moveSpeed * dt;
  unit.x += (dx / len) * Math.min(step, len);
  unit.y += (dy / len) * Math.min(step, len);
}

export function clampMapBounds(unit, world) {
  unit.x = Math.max(20, Math.min(world.width - 20, unit.x));
  unit.y = Math.max(20, Math.min(world.height - 20, unit.y));
}
