import { useStore } from "../state";

const start = "export function Lights() {\n\treturn (\n\t\t<group>";
const end = "\t\t</group>\n\t);\n}";

const IGNORE_FIELDS = ["id", "type", "name"];

export function exportLights() {
  const components = [start];

  useStore.getState().lights.map((l) => {
    switch (l.type) {
      case "area":
        const t = `\t\t\t<rectAreaLight ${Object.entries(l)
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

  return components.join("\n");
}

function addField(name: string, value: any): string {
  if (Array.isArray(value)) {
    return `${name}={[${value.join(",")}]}`;
  } else if (typeof value === "string") {
    return `${name}={"${value}"}`;
  }
  return `${name}={${value}}`;
}
