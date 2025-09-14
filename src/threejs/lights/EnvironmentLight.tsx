import { Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useStore } from "../../state";
import type { EnvironmentLight as EL } from "../../types/lights";
import { useShallow } from "zustand/shallow";

export function EnvironmentLight({ id }: { id: string }) {
  const lightRef = useRef<THREE.Group>(null!);
  const l = useStore(
    useShallow((s) => s.lights.find((x) => x.id === id)),
  ) as EL;

  useEffect(() => {
    const { setLightRef } = useStore.getState();
    setLightRef(id, lightRef.current);
    return () => {
      setLightRef(id, null);
    };
  }, [id]);

  return (
    <Environment
      files={l?.url ?? undefined}
      background={l?.background}
      backgroundRotation={l?.bgRotation}
      environmentRotation={l?.envRotation}
      backgroundIntensity={l?.bgIntensity}
      environmentIntensity={l?.envIntensity}
      preset={l?.url ? undefined : "studio"}
      ref={lightRef}
    />
  );
}
