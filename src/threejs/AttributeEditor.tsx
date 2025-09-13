import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useStore } from "../state";

type Snap = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  width: number;
  height: number;
};

export function AttributeEditor() {
  const selectionId = useStore((s) => s.selection?.id);
  const tc = useStore((s) =>
    selectionId ? (s.refs.tc[selectionId] ?? null) : null,
  );
  const group = useStore((s) =>
    selectionId ? (s.refs.group[selectionId] ?? null) : null,
  );
  const light = useStore((s) =>
    selectionId ? (s.refs.light[selectionId] ?? null) : null,
  );

  const [snap, setSnap] = useState<Snap | null>(null);

  const compute = useMemo(
    () => () => {
      if (!group || !light) return;
      const pos = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      const scl = new THREE.Vector3();
      group.updateMatrixWorld(true);
      group.matrixWorld.decompose(pos, quat, scl);
      const euler = new THREE.Euler().setFromQuaternion(quat, "XYZ");
      setSnap({
        position: [pos.x, pos.y, pos.z],
        rotation: [euler.x, euler.y, euler.z],
        scale: [scl.x, scl.y, scl.z],
        width: light.width,
        height: light.height,
      });
    },
    [group, light],
  );

  useEffect(() => {
    if (!tc) {
      setSnap(null);
      return;
    }
    compute(); // initial
    const onChange = () => compute();
    tc.addEventListener("change", onChange);
    return () => tc.removeEventListener("change", onChange);
  }, [tc, compute]);

  if (!selectionId || !snap) {
    return <div className="p-3 text-sm text-neutral-400">No selection</div>;
  }

  return (
    <div className="flex flex-col p-3 gap-2 text-sm">
      <Row label="Position" value={snap.position} />
      <Row label="Rotation" value={snap.rotation} />
      <Row label="Scale" value={snap.scale} />
      <Row label="Width" value={snap.width} />
      <Row label="Height" value={snap.height} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-2 overflow-auto">
      <p className="opacity-70">{label}</p>
      <p className="font-mono truncate">
        {Array.isArray(value)
          ? value.map((n) => n.toFixed(3)).join(", ")
          : Number(value).toFixed(3)}
      </p>
    </div>
  );
}
