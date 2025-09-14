import {
  Box,
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo, type JSX } from "react";
import { useStore, type Store } from "../state";
import { LightComponent } from "./lights/LightComponent";
import { shallow } from "zustand/shallow";

import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

const selection = (s: Store) => ({
  sceneUrl: s.sceneUrl,
  ids: s.lights.map((l) => ({
    id: l.id,
    type: l.type,
  })),
});

export function Viewport(): JSX.Element {
  const { ids, sceneUrl } = useStore(selection, shallow);
  useMemo(() => RectAreaLightUniformsLib.init(), []);

  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera />
        <OrbitControls makeDefault />
        <Grid
          sectionColor={"#555"}
          sectionSize={1}
          sectionThickness={1}
          infiniteGrid
        />

        {sceneUrl ? (
          <Model url={sceneUrl} />
        ) : (
          <Box args={[1, 1, 1, 1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial roughness={0} metalness={0} color={"grey"} />
          </Box>
        )}

        {ids.map((i) => (
          <LightComponent key={i.id} {...i} />
        ))}

        <GizmoHelper
          alignment="bottom-right" // widget alignment within scene
          margin={[80, 80]} // widget margins (X, Y)
        >
          <GizmoViewport
            axisColors={["red", "green", "blue"]}
            labelColor="black"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <group>
      <primitive object={scene} />
    </group>
  );
}
