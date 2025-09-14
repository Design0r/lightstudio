import { useMemo, type JSX } from "react";
import { LightComponentMap, type LightType } from "../../types/lights";

export function LightComponent({
  id,
  type,
}: {
  id: string;
  type: LightType;
}): JSX.Element {
  const Curr = useMemo(() => LightComponentMap[type], [type]);

  return <Curr id={id} type={type} />;
}
