import type { TransformControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

export type LightType = "area" | "directional" | "hdri" | "point";

export interface Light {
  name: string;
  type: LightType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  width: number;
  height: number;
  color: string;
  intensity: number;
  id: string;
}

export type Registry = {
  tc: Record<string, TransformControls | null>;
  group: Record<string, THREE.Object3D | null>;
  light: Record<string, THREE.RectAreaLight | null>;
};
