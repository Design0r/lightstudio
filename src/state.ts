import { create } from "zustand";
import type { Controls } from "./types/controls";
import type { Light, LightType, Patch, Registry } from "./types/lights";
import { generateUUID } from "three/src/math/MathUtils.js";
import type { TransformControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { subscribeWithSelector } from "zustand/middleware";

type Store = {
  sceneUrl: string | null;
  setSceneUrl: (value: string | null) => void;
  scene: ArrayBuffer | string | null;
  setScene: (value: string | ArrayBuffer) => void;

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

  applyLightPatch: (id: string, patch: Patch) => void;
  readLiveSnapshot: (id: string) =>
    | (Patch & {
        position: [number, number, number];
        rotation: [number, number, number];
        width: number;
        height: number;
      })
    | null;
};

export const useStore = create<Store>()(
  subscribeWithSelector((set, get) => ({
    sceneUrl: null,
    setSceneUrl: (value) => set(() => ({ sceneUrl: value })),
    scene: null,
    setScene: (value) => set(() => ({ scene: value })),

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

    applyLightPatch: (id, patch) => {
      const { refs, updateLight } = get();
      const g = refs.group[id];
      const l = refs.light[id];
      if (!l || !g) return;

      if (patch.position) {
        g.position.fromArray(patch.position);
        l.position.copy(g.position);
        refs.tc[id]?.update?.();
      }
      if (patch.rotation) {
        g.rotation.set(patch.rotation[0], patch.rotation[1], patch.rotation[2]);
        l.quaternion.copy(g.quaternion);
        refs.tc[id]?.update?.();
      }
      if (patch.intensity !== undefined) l.intensity = patch.intensity;
      if (patch.color) l.color.set(patch.color);
      if (patch.name) {
        /* no scene mutation needed */
      }

      // persist to store (doesn't re-render <AreaLight> because it renders by id only)
      const next: Partial<Light> = {};
      if (patch.position) next.position = patch.position;
      if (patch.rotation) next.rotation = patch.rotation;
      if (patch.width !== undefined) next.width = l.width;
      if (patch.height !== undefined) next.height = l.height;
      if (patch.intensity !== undefined) next.intensity = patch.intensity;
      if (patch.color) next.color = patch.color;
      if (patch.name) next.name = patch.name;
      if (Object.keys(next).length) updateLight(id, next);
    },

    readLiveSnapshot: (id) => {
      const { refs } = get();
      const g = refs.group[id];
      const l = refs.light[id];
      if (!g || !l) return null;
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3();
      g.updateMatrixWorld(true);
      g.matrixWorld.decompose(pos, quat, scl);
      const e = new THREE.Euler().setFromQuaternion(quat, "XYZ");
      return {
        position: [pos.x, pos.y, pos.z],
        rotation: [e.x, e.y, e.z],
        width: l.width,
        height: l.height,
        // you can add scale if you keep a proxy scale; we bake size into width/height instead
      };
    },
  })),
);
