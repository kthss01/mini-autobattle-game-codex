export class StatsCollector {
  constructor() {
    this.byUnit = new Map();
  }

  ensure(unit) {
    if (!this.byUnit.has(unit.id)) this.byUnit.set(unit.id, { damage: 0, heal: 0, kills: 0, deaths: 0 });
    return this.byUnit.get(unit.id);
  }
}
