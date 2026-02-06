import Phaser from 'phaser';
import { CHAMPIONS, createTeamFromChampionIds } from '@autobattle/sim';

export class MatchScene extends Phaser.Scene {
  constructor() {
    super('MatchScene');
  }

  create() {
    const teamA = createTeamFromChampionIds('A', CHAMPIONS.slice(0, 3).map((c) => c.id));
    const teamB = createTeamFromChampionIds('B', CHAMPIONS.slice(3, 6).map((c) => c.id));

    this.add.text(20, 20, 'Mini Autobattle (Ticket 1-2 setup)', { color: '#ffffff' });
    this.add.text(20, 60, `Team A: ${teamA.units.map((u) => u.championId).join(', ')}`, { color: '#7dd3fc' });
    this.add.text(20, 90, `Team B: ${teamB.units.map((u) => u.championId).join(', ')}`, { color: '#fca5a5' });
    this.add.text(20, 130, 'Simulation core/render sync will be implemented in later tickets.', { color: '#d1d5db' });
  }
}
