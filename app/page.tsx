'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import NameInput from './components/NameInput';

const Game = dynamic(() => import('./components/Game'), { ssr: false });

export default function HomePage() {
  const [name, setName] = useState<string | null>(null);

  return (
    <div>
      {name ? (
        <Game playerName={name} />
      ) : (
        <NameInput onNameSubmit={setName} />
      )}
    </div>
  );
}