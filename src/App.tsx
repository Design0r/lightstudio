import { Viewport } from "./threejs/Viewport";
import { useEffect } from "react";
import { useStore } from "./state";
import { AttributeEditor } from "./threejs/AttributeEditor";

function App() {
  const store = useStore();

  useEffect(() => {
    addEventListener("keyup", (e) => {
      if (e.code === "KeyQ") store.setSelection(null);
      else if (e.code === "KeyE") store.setTransformMode("translate");
      else if (e.code === "KeyR") store.setTransformMode("rotate");
      else if (e.code === "KeyT") store.setTransformMode("scale");
    });
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = () => {
      const arrayBuffer = reader.result;
      if (!arrayBuffer) return;
      const url = URL.createObjectURL(new Blob([arrayBuffer]));
      store.setScene(arrayBuffer);
      store.setSceneUrl(url.toString());
    };
  };

  return (
    <div className="w-full h-full flex flex-col overflow-clip">
      <div className="w-full h-20 bg-neutral-800 items-center flex">
        <div className="px-4 space-x-2 flex">
          <input
            className="file-input file-input-bordered file-input-primary w-full"
            type="file"
            accept=".glb, .gltf"
            onChange={handleFileChange}
          />
          <button
            onClick={() => store.addLight("area")}
            type="button"
            className="btn btn-primary"
          >
            Area Light
          </button>
          <button
            onClick={() => store.addLight("environment")}
            type="button"
            className="btn btn-primary"
          >
            Environment Light
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-2 bg-neutral-700 ">
          <ul className="menu w-full ">
            <li>
              <details open>
                <summary className="text-xl">Outliner</summary>
                <ul>
                  {store.lights.map((l) => (
                    <li key={l.id}>
                      <a onClick={() => store.setSelection(l)}>{l.name}</a>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          </ul>
        </div>
        <div className="col-span-8 bg-neutral-500">
          <Viewport />
        </div>
        <div className="col-span-2 bg-neutral-700">
          <div className="flex flex-col p-3">
            <AttributeEditor />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
