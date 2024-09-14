import { Player } from '../classes/Player';
import { AIPlayer } from '../classes/AIPlayer';
import { Server } from 'socket.io';
import logger from '../utils/logger';

export class GameState {
  players: { [id: string]: Player } = {};
  io: Server;
  trails: { [team: string]: Array<[number, number, number]> } = { blue: [], orange: [] };
  scores: { blue: number; orange: number } = { blue: 0, orange: 0 };

  constructor(io: Server) {
    this.io = io;
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
    logger.info(`Player added: ${player.id}`);
    this.broadcastGameState();
  }

  removePlayer(playerId: string) {
    delete this.players[playerId];
    logger.info(`Player removed: ${playerId}`);
    this.broadcastGameState();
  }

  broadcastGameState() {
    this.io.emit('updateGameState', {
      players: this.getPlayerData(),
      trails: this.trails,
      scores: this.scores,
    });
  }

  getPlayerData() {
    return Object.values(this.players).map((player) => ({
      id: player.id,
      name: player.name,
      position: player.position,
      direction: player.direction,
      color: player.color,
      team: player.team,
      isAI: player.isAI,
    }));
  }

  update() {
    // Update the game state, move AI players, check collisions, etc.
    for (const player of Object.values(this.players)) {
      if (player.isAI) {
        (player as AIPlayer).decideNextMove();
      } else {
        player.move();
      }
      this.updateTrail(player);
    }
    this.checkCollisions();
    this.broadcastGameState();
  }

  updateTrail(player: Player) {
    // Add the player's new position to their team's trail
    this.trails[player.team].push([...player.position]);
    // Implement trail decay logic if needed
  }

  checkCollisions() {
    // Simplified collision detection logic
    for (const player of Object.values(this.players)) {
      // Check collision with trails
      const enemyTeam = player.team === 'blue' ? 'orange' : 'blue';
      for (const trailPos of this.trails[enemyTeam]) {
        if (
          player.position[0] === trailPos[0] &&
          player.position[1] === trailPos[1] &&
          player.position[2] === trailPos[2]
        ) {
          // Collision detected
          this.handleCollision(player, enemyTeam);
          break;
        }
      }
    }
  }

  handleCollision(player: Player, enemyTeam: 'blue' | 'orange') {
    logger.info(`Collision detected for player ${player.id}`);
    // Remove the player from the game
    delete this.players[player.id];
    // Update scores
    this.scores[enemyTeam] += 1;
    this.checkGameEndCondition();
  }

  checkGameEndCondition() {
    if (this.scores.blue >= 10 || this.scores.orange >= 10) {
      const winningTeam = this.scores.blue >= 10 ? 'Blue' : 'Orange';
      logger.info(`${winningTeam} team has won the game!`);
      this.io.emit('gameOver', { winningTeam });
      this.resetGame();
    } else {
      // Check if any team has no players left
      const blueTeamAlive = Object.values(this.players).some((p) => p.team === 'blue');
      const orangeTeamAlive = Object.values(this.players).some((p) => p.team === 'orange');
      if (!blueTeamAlive || !orangeTeamAlive) {
        // Reset the game for a new round
        this.resetRound();
      }
    }
  }

  resetRound() {
    logger.info('Resetting round');
    // Reset players' positions and trails
    for (const player of Object.values(this.players)) {
      player.position = [Math.random() * 20 - 10, 0, Math.random() * 20 - 10];
      player.direction = [0, 0, 1];
    }
    this.trails = { blue: [], orange: [] };
    this.broadcastGameState();
  }

  resetGame() {
    logger.info('Resetting game');
    this.scores = { blue: 0, orange: 0 };
    this.resetRound();
  }
}