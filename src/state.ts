import { create } from "zustand";
import type { Controls } from "./types/controls";
import type { Light, LightType, Registry } from "./types/lights";
import { generateUUID } from "three/src/math/MathUtils.js";
import type { TransformControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";

type Store = {
  transformMode: Controls;
  setTransformMode: (value: Controls) => void;
  selection: Light | null;
  setSelection: (value: Light | null) => void;
  lights: Light[];
  addLight: (value: LightType) => void;
  removeLight: (value: Light) => void;
  updateLight: (id: string, value: Partial<Light>) => void;

  refs: Registry;
  setTCRef: (id: string, ref: TransformControls | null) => void;
  setGroupRef: (id: string, ref: THREE.Object3D | null) => void;
  setLightRef: (id: string, ref: THREE.RectAreaLight | null) => void;
};

export const useStore = create<Store>((set, get) => ({
  transformMode: undefined,
  setTransformMode: (value) => set(() => ({ transformMode: value })),

  selection: null,
  setSelection: (value) => set(() => ({ selection: value })),

  lights: [],
  addLight: (type: LightType) => {
    const id = generateUUID();
    const light: Light = {
      name: `${type}-light-${get().lights.filter((l) => l.type === type).length}`,
      type: type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: 1,
      height: 1,
      color: "white",
      intensity: 10,
      id: id,
    };
    set({ lights: [...get().lights, light] });
    set({ selection: light });
  },
  removeLight: (value: Light) =>
    set({ lights: get().lights.filter((l) => l.id !== value.id) }),

  updateLight: (id: string, props: Partial<Light>) => {
    set({
      lights: get().lights.map((l) => (l.id === id ? { ...l, ...props } : l)),
    });
  },

  refs: { tc: {}, group: {}, light: {} },
  setTCRef: (id, ref) =>
    set((s) => ({ refs: { ...s.refs, tc: { ...s.refs.tc, [id]: ref } } })),
  setGroupRef: (id, ref) =>
    set((s) => ({
      refs: { ...s.refs, group: { ...s.refs.group, [id]: ref } },
    })),
  setLightRef: (id, ref) =>
    set((s) => ({
      refs: { ...s.refs, light: { ...s.refs.light, [id]: ref } },
    })),
}));
