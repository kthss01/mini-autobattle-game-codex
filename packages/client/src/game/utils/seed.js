const RANDOM_SEED_MAX_EXCLUSIVE = 1_000_000_000;
const MAX_ALLOWED_SEED = Number.MAX_SAFE_INTEGER;

export function parseSeedInput(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return { ok: false, message: 'Seed is required.' };
  if (!/^[-+]?\d+$/.test(trimmed)) return { ok: false, message: 'Seed must be an integer.' };

  const seed = Number(trimmed);
  if (!Number.isSafeInteger(seed)) return { ok: false, message: `Seed must be within ±${MAX_ALLOWED_SEED}.` };
  if (seed < 0) return { ok: false, message: 'Seed must be >= 0.' };

  return { ok: true, seed };
}

export function createRandomSeed() {
  return Math.floor(Math.random() * RANDOM_SEED_MAX_EXCLUSIVE);
}
