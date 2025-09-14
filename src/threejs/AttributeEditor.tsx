// src/Inspector.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../state";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

type Form = {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number; // degrees in UI
  width: number;
  height: number;
  intensity: number;
  color: string;
};

export function AttributeEditor() {
  const selectionId = useStore((s) => s.selection?.id);
  const tc = useStore((s) =>
    selectionId ? (s.refs.tc[selectionId] ?? null) : null,
  );
  const readLiveSnapshot = useStore((s) => s.readLiveSnapshot);
  const applyLightPatch = useStore((s) => s.applyLightPatch);
  const selected = useStore(
    useMemo(
      () => (s) => s.lights.find((l) => l.id === s.selection?.id) ?? null,
      [],
    ),
  );

  const [form, setForm] = useState<Form | null>(null);

  // pull initial/live values
  const pull = useCallback(() => {
    if (!selectionId) {
      setForm(null);
      return;
    }
    const snap = readLiveSnapshot(selectionId);
    const l = selected;
    if (!snap || !l) {
      setForm(null);
      return;
    }
    setForm({
      px: snap.position[0],
      py: snap.position[1],
      pz: snap.position[2],
      rx: deg(snap.rotation[0]),
      ry: deg(snap.rotation[1]),
      rz: deg(snap.rotation[2]),
      width: snap.width,
      height: snap.height,
      intensity: l.intensity,
      color: l.color,
    });
  }, [selectionId, readLiveSnapshot, selected]);

  // keep in sync while dragging gizmo
  useEffect(() => {
    if (!tc) {
      pull();
      return;
    }
    pull();
    const onChange = pull;
    tc.addEventListener("change", onChange);
    return () => tc.removeEventListener("change", onChange);
  }, [tc, pull]);

  if (!selectionId || !form)
    return <div className="p-3 text-sm text-neutral-400">No selection</div>;

  const upd = (patch: Partial<Form>) => setForm((f) => ({ ...f!, ...patch }));
  const patchScene = (partial: Partial<Form>) => {
    const p: any = {};
    if ("px" in partial || "py" in partial || "pz" in partial) {
      p.position = [
        partial.px ?? form.px,
        partial.py ?? form.py,
        partial.pz ?? form.pz,
      ] as [number, number, number];
    }
    if ("rx" in partial || "ry" in partial || "rz" in partial) {
      p.rotation = [
        rad(partial.rx ?? form.rx),
        rad(partial.ry ?? form.ry),
        rad(partial.rz ?? form.rz),
      ] as [number, number, number];
    }
    if ("width" in partial) p.width = partial.width;
    if ("height" in partial) p.height = partial.height;
    if ("intensity" in partial) p.intensity = partial.intensity;
    if ("color" in partial) p.color = partial.color;
    applyLightPatch(selectionId, p);
  };

  const onNumber =
    (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      upd({ [key]: v } as any);
      patchScene({ [key]: v } as any);
    };
  const onText =
    (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      upd({ [key]: v } as any);
      patchScene({ [key]: v } as any);
    };

  return (
    <div className="flex flex-col p-3 gap-3 text-sm">
      <Group label="Position">
        <NumberField label="X" value={form.px} onChange={onNumber("px")} />
        <NumberField label="Y" value={form.py} onChange={onNumber("py")} />
        <NumberField label="Z" value={form.pz} onChange={onNumber("pz")} />
      </Group>
      <Group label="Rotation (°)">
        <NumberField label="X" value={form.rx} onChange={onNumber("rx")} />
        <NumberField label="Y" value={form.ry} onChange={onNumber("ry")} />
        <NumberField label="Z" value={form.rz} onChange={onNumber("rz")} />
      </Group>
      <Group label="Size">
        <NumberField
          label="W"
          value={form.width}
          onChange={onNumber("width")}
          min={0.01}
          step={0.01}
        />
        <NumberField
          label="H"
          value={form.height}
          onChange={onNumber("height")}
          min={0.01}
          step={0.01}
        />
      </Group>
      <Group label="Light">
        <NumberField
          label="Intensity"
          value={form.intensity}
          onChange={onNumber("intensity")}
          step={0.1}
        />
        <div className="grid grid-cols-2 items-center">
          <span className="opacity-70">Color</span>
          <input
            className="input input-bordered input-sm"
            type="color"
            value={form.color}
            onChange={onText("color")}
          />
        </div>
      </Group>
    </div>
  );
}

function Group({
  label,
  children,
}: React.PropsWithChildren<{ label: string }>) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs uppercase tracking-wider opacity-70">{label}</div>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}
function NumberField({
  label,
  value,
  onChange,
  min,
  step,
}: {
  label: string;
  value: number;
  onChange: any;
  min?: number;
  step?: number;
}) {
  return (
    <>
      <span className="opacity-70">{label}</span>
      <input
        type="number"
        className="input input-bordered input-sm font-mono"
        value={Number.isFinite(value) ? value.toFixed(3) : 0}
        onChange={onChange}
        min={min}
        step={step ?? 0.01}
      />
    </>
  );
}
