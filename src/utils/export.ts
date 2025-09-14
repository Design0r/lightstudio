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

const IGNORE_FIELDS = ["id", "type", "name"];

export function exportLights() {
  const components = [start];

  useStore.getState().lights.map((l) => {
    switch (l.type) {
      case "area":
        const t = `            <rectAreaLight ${Object.entries(l)
          .filter(([k]) => !IGNORE_FIELDS.includes(k))
          .map(([k, v]) => addField(k, v))
          .join(" ")} />`;
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
  }
  return `${name}={${value}}`;
}
