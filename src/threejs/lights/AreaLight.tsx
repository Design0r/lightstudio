import { TransformControls } from "@react-three/drei";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { TransformControls as TC } from "three/examples/jsm/Addons.js";
import { useStore } from "../../state";

export function AreaLight({ id }: { id: string }) {
  const ctrl = useRef<TC>(null!);
  const group = useRef<THREE.Group>(null!);
  const light = useRef<THREE.RectAreaLight>(null!);

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
    const unsubMode = useStore.subscribe(
      (s) => s.transformMode,
      (m) => {
        ctrl.current?.setMode(m ?? "translate");
      },
      { fireImmediately: false, equalityFn: Object.is },
    );
    const unsubSel = useStore.subscribe(
      (s) => s.selection,
      (sel) => {
        const on = sel ? sel.id === id : false;
        ctrl.current.enabled = on;
        ctrl.current.showX = ctrl.current.showY = ctrl.current.showZ = on;
      },
      { fireImmediately: false, equalityFn: Object.is },
    );
    return () => {
      unsubMode();
      unsubSel();
    };
  }, [id]);

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
        <rectAreaLight args={["white", 10, 1, 1]} ref={light} />
      </group>
    </TransformControls>
  );
}
