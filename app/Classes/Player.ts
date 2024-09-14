import { Vector3 } from '../../types/Player';

export class Player {
  id: string;
  name: string;
  position: Vector3;
  direction: Vector3;
  color: string;
  team: 'blue' | 'orange';
  isAI: boolean;

  constructor(data: {
    id: string;
    name: string;
    position: Vector3;
    direction: Vector3;
    color: string;
    team: 'blue' | 'orange';
    isAI?: boolean;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.position = data.position;
    this.direction = data.direction;
    this.color = data.color;
    this.team = data.team;
    this.isAI = data.isAI || false;
  }

  move() {
    this.position = [
      this.position[0] + this.direction[0],
      this.position[1] + this.direction[1],
      this.position[2] + this.direction[2],
    ];
  }

  turn(direction: 'left' | 'right') {
    // Update direction by turning 90 degrees left or right
    const [dx, dy, dz] = this.direction;
    if (direction === 'left') {
      this.direction = [-dz, dy, dx];
    } else if (direction === 'right') {
      this.direction = [dz, dy, -dx];
    }
  }
}