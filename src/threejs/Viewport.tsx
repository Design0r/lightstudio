import {
  Box,
  GizmoHelper,
  GizmoViewport,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import type { JSX } from "react";
import { AreaLight } from "./lights/AreaLight";
import { useStore } from "../state";
import { useShallow } from "zustand/react/shallow";

export function Viewport(): JSX.Element {
  const ids = useStore(useShallow((s) => s.lights.map((l) => l.id)));

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
        <Box args={[10, 10, 1, 1, 1, 1]} position={[0, 0, 0]}>
          <meshStandardMaterial roughness={0} metalness={0} color={"grey"} />
        </Box>

        {ids.map((i) => (
          <AreaLight key={i} id={i} />
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
