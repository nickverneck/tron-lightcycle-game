import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSocket } from '../contexts/SocketContext';
import Lightcycle from './Lightcycle';

interface GameState {
  players: {
    [id: string]: {
      position: [number, number, number];
      color: string;
      name: string;
    };
  };
}

const Game: React.FC = () => {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
        // Update positions based on game state
        // Since the server is authoritative, the gameState should be updated from server events
  
        // Request next frame
        animationFrameId = requestAnimationFrame(animate);
      };
  
      animate();
  
      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }, [gameState]);
  
    if (socket) {
      socket.on('connect', () => {
        setPlayerId(socket.id);
      });

      socket.on('updateGameState', (state: GameState) => {
        setGameState(state);
      });

      // Clean up on unmount
      return () => {
        socket.off('connect');
        socket.off('updateGameState');
      };
    }
  }, [socket]);

  // Handle user input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (socket && playerId) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          socket.emit('playerMove', { playerId, direction: event.key });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, playerId]);

  return (
    <Canvas>
      {/* Set up lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* Render the floor grid */}
      <gridHelper args={[100, 100, 'white', 'gray']} />

      {/* Render the Lightcycles */}
      {gameState &&
        Object.values(gameState.players).map((player) => (
          <Lightcycle
            key={player.name}
            position={player.position}
            color={player.color}
          />
        ))}

      {/* Add walls or boundaries if needed */}
    </Canvas>
  );
};

export default Game;