// pages/api/socket.ts

import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '../../types/next';
import { Server } from 'socket.io';
import { Server as NetServer } from 'http';
import { Socket } from 'socket.io';
import logger from '../../utils/logger';
import { GameState } from '../../game/GameState';
import { Player } from '../../classes/Player';
import { AIPlayer } from '../../classes/AIPlayer';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    logger.info('Initializing Socket.IO server...');
    const httpServer: NetServer = res.socket.server as any;
    const io = new Server(httpServer, {
      path: '/api/socketio',
    });
    res.socket.server.io = io;

    const gameState = new GameState(io);

    io.on('connection', (socket: Socket) => {
      logger.info('Client connected', { socketId: socket.id });

      // Handle player joining
      socket.on('joinGame', (data: { name: string }) => {
        try {
          const player = new Player({
            id: socket.id,
            name: data.name,
            position: [Math.random() * 20 - 10, 0, Math.random() * 20 - 10],
            direction: [0, 0, 1],
            color: 'teal',
            team: 'blue',
          });
          gameState.addPlayer(player);

          // Add AI player
          const aiPlayer = new AIPlayer({
            id: `AI_${socket.id}`,
            name: `AI_${Math.floor(Math.random() * 1000)}`,
            position: [Math.random() * 20 - 10, 0, Math.random() * 20 - 10],
            direction: [0, 0, 1],
            color: 'orange',
            team: 'orange',
          });
          gameState.addPlayer(aiPlayer);

          socket.emit('joinedGame', { playerId: socket.id });
        } catch (error) {
          logger.error('Error adding player', { error });
          socket.emit('error', { message: 'Failed to join game' });
        }
      });

      // Handle player movement
      socket.on('playerMove', (data: { direction: string }) => {
        try {
          const player = gameState.players[socket.id];
          if (player) {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(data.direction)) {
              player.turn(
                data.direction === 'ArrowLeft' ? 'left' : data.direction === 'ArrowRight' ? 'right' : null
              );
              player.move();
              gameState.updateTrail(player);
              gameState.broadcastGameState();
            }
          }
        } catch (error) {
          logger.error('Error processing player move', { error });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        try {
          gameState.removePlayer(socket.id);
          // Also remove associated AI player
          gameState.removePlayer(`AI_${socket.id}`);
        } catch (error) {
          logger.error('Error handling disconnect', { error });
        }
        logger.info('Client disconnected', { socketId: socket.id });
      });
    });

    // Game loop
    setInterval(() => {
      try {
        gameState.update();
      } catch (error) {
        logger.error('Error updating game state', { error });
      }
    }, 100); // Update every 100 ms
  } else {
    logger.info('Socket.IO server already running.');
  }
  res.end();
}
