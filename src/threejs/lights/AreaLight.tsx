import { TransformControls } from "@react-three/drei";
import { memo, useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { TransformControls as TC } from "three/examples/jsm/Addons.js";
import { useStore } from "../../state";

export const AreaLight = memo(function AreaLight({ id }: { id: string }) {
  const ctrl = useRef<TC>(null!);
  const group = useRef<THREE.Group>(null!);
  const light = useRef<THREE.RectAreaLight>(null!);
  const store = useStore();

  useLayoutEffect(() => {
    const l = useStore.getState().lights.find((x) => x.id === id)!;
    light.current.color.set(l.color);
    light.current.intensity = l.intensity;
    light.current.width = l.width;
    light.current.height = l.height;
  }, [id]);

  useEffect(() => {
    const { setTCRef, setGroupRef, setLightRef } = useStore.getState();
    setTCRef(id, ctrl.current);
    setGroupRef(id, group.current);
    setLightRef(id, light.current);
    return () => {
      setTCRef(id, null);
      setGroupRef(id, null);
      setLightRef(id, null);
    };
  }, [id]);

  useEffect(() => {
    const c = ctrl.current;
    if (c) {
      c.setMode(store.transformMode || "translate");
    }
  }, [store.transformMode]);

  useEffect(() => {
    const c = ctrl.current;
    if (c) {
      c.showX = c.showY = c.showZ = store.selection?.id === id;
    }
  }, [store.selection]);

  const apply = () => {
    const sx = ctrl.current.worldScale.x || 1;
    const sy = ctrl.current.worldScale.y || 1;
    const newW = Math.max(0.01, sx);
    const newH = Math.max(0.01, sy);
    light.current.width = newW;
    light.current.height = newH;
  };

  return (
    <TransformControls ref={ctrl} onChange={apply}>
      <group ref={group}>
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe color="yellow" />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe color="yellow" />
        </mesh>
        <mesh
          position={[0, 0, -0.125]}
          rotation={[0, Math.PI / 2, Math.PI / 2]}
          scale={[0, 0.25, 0]}
        >
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial wireframe color="yellow" />
        </mesh>
        <rectAreaLight ref={light} />
      </group>
    </TransformControls>
  );
});
