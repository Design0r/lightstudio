import { useStore } from "../state";
import hljs from "highlight.js/lib/core";
import jsx from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("jsx", jsx);

const start = `import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";


export function Lights() {
    RectAreaLightUniformsLib.init();

    return (
        <group>`;
const end = "        </group>\n    );\n}";

const IGNORE_FIELDS = new Set([
  "id",
  "type",
  "name",
  "position",
  "rotation",
  "scale",
  "width",
  "height",
]);

const INCLUDE_FIELDS = new Set(["worldPosition", "worldRotation"]);

export function exportLights() {
  const components = [start];

  const state = useStore.getState();

  state.lights.map((l) => {
    switch (l.type) {
      case "area":
        const fields = Object.entries(l)
          .filter(([k]) => !IGNORE_FIELDS.has(k))
          .map(([k, v]) => addField(k, v));

        const ctrl = state.refs.tc[l.id];
        if (!ctrl) return;
        const ctrlFields = Object.entries(ctrl)
          .filter(([k]) => INCLUDE_FIELDS.has(k))
          .map(([k, v]) => addField(k, v));

        ctrlFields.push(addField("width", ctrl.worldScale.x));
        ctrlFields.push(addField("height", ctrl.worldScale.y));

        const t = `            <rectAreaLight ${ctrlFields.concat(fields).join(" ")} />`;
        components.push(t);

        break;

      case "environment":
      default:
        throw new Error("invalid light type");
    }
  });

  components.push(end);

  return hljs.highlight(components.join("\n"), { language: "jsx" }).value;
}

function addField(name: string, value: any): string {
  if (Array.isArray(value)) {
    return `${name}={[${value.join(",")}]}`;
  } else if (typeof value === "string") {
    return `${name}={"${value}"}`;
  } else if (typeof value === "object") {
    return addField(name, [value.x, value.y, value.z]);
  }
  return `${name}={${value}}`;
}
