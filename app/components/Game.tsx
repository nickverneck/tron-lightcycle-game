// app/components/Game.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useSocket } from '../contexts/SocketContext';
import Lightcycle from './Lightcycle';

interface GameProps {
  playerName: string;
}

interface GameState {
  players: {
    [id: string]: {
      position: [number, number, number];
      color: string;
      name: string;
      team: 'blue' | 'orange';
      isAI: boolean;
    };
  };
  trails: {
    [team: string]: Array<[number, number, number]>;
  };
  scores: {
    blue: number;
    orange: number;
  };
}

const Game: React.FC<GameProps> = ({ playerName }) => {
  const { socket } = useSocket();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  // Handle socket connection and join game
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        setPlayerId(socket.id);
        socket.emit('joinGame', { name: playerName });
      };

      socket.on('connect', handleConnect);

      // Handle updated game state
      socket.on('updateGameState', (state: GameState) => {
        setGameState(state);
      });

      socket.on('gameOver', ({ winningTeam }: { winningTeam: string }) => {
        alert(`${winningTeam} team has won the game!`);
      });

      // Clean up event listeners on unmount
      return () => {
        socket.off('connect', handleConnect);
        socket.off('updateGameState');
        socket.off('gameOver');
      };
    }
  }, [socket, playerName]);

  // Handle user input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (socket && playerId) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
          socket.emit('playerMove', { direction: event.key });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, playerId]);

  return (
    <Canvas  style={{height:"800px"}} camera={{ position: [0, 10, 20], fov: 60 }}>
      {/* Set up lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 10, 5]} intensity={1} />

      {/* Add OrbitControls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={100}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0, 0]}
      />

      {/* Render the floor grid */}
      <gridHelper args={[100, 100, 'white', 'gray']} />

      {/* Render the Lightcycles */}
      {gameState &&
        Object.values(gameState.players).map((player) => (
          <Lightcycle
            key={player.id}
            position={player.position}
            color={player.color}
          />
        ))}

      {/* Add walls or boundaries if needed */}
    </Canvas>
  );
};

export default Game;
