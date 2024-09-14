import React from 'react';
import { MeshProps } from '@react-three/fiber';

interface LightcycleProps extends MeshProps {
  color: string;
}

const Lightcycle: React.FC<LightcycleProps> = ({ color, ...props }) => {
  return (
    <mesh {...props}>
      <boxGeometry args={[1, 0.5, 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Lightcycle;