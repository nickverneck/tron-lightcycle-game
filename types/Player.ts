export type Vector3 = [number, number, number];

export interface PlayerData {
  id: string;
  name: string;
  position: Vector3;
  direction: Vector3;
  color: string;
  team: 'blue' | 'orange';
  isAI: boolean;
}