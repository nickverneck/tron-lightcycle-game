import { Player } from './Player';

export class AIPlayer extends Player {
  constructor(data: {
    id: string;
    name: string;
    position: [number, number, number];
    direction: [number, number, number];
    color: string;
    team: 'blue' | 'orange';
  }) {
    super({ ...data, isAI: true });
  }

  decideNextMove() {
    // Simple AI logic to change direction randomly
    const randomTurn = Math.random();
    if (randomTurn < 0.33) {
      this.turn('left');
    } else if (randomTurn < 0.66) {
      this.turn('right');
    }
    // Move forward
    this.move();
  }
}