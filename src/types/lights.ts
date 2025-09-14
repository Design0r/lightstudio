import type { TransformControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import type { ReactNode } from "react";
import { AreaLight } from "../threejs/lights/AreaLight";
import { EnvironmentLight } from "../threejs/lights/EnvironmentLight";

export type LightType = "area" | "directional" | "environment" | "point";

export interface BaseLight {
  name: string;
  type: LightType;
  id: string;
}

export interface AreaLight extends BaseLight {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  width: number;
  height: number;
  color: string;
  intensity: number;
}

export interface EnvironmentLight extends BaseLight {
  envRotation: [number, number, number];
  bgRotation: [number, number, number];
  envIntensity: number;
  bgIntensity: number;
  background: boolean;
  url: string;
}

export type Light = AreaLight | EnvironmentLight;

export type Registry = {
  tc: Record<string, TransformControls | null>;
  group: Record<string, THREE.Object3D | null>;
  light: Record<string, THREE.RectAreaLight | null>;
};

export type Patch = Partial<
  Pick<
    BaseLight,
    | "position"
    | "rotation"
    | "width"
    | "height"
    | "intensity"
    | "color"
    | "name"
  >
>;

export const LightComponentMap: Record<LightType, ReactNode> = {
  area: AreaLight,
  environment: EnvironmentLight,
};
