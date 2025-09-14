import { useState, type JSX } from "react";

export function Modal({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false);

  return (
    <dialog id="my_modal_2" className="modal w-full">
      <div className="modal-box">
        <div className="flex items-center space-x-2 pb-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(text);
              setCopied(true);
            }}
            className="btn btn-primary"
          >
            copy
          </button>
          {copied && <p>copied to clipboard</p>}
        </div>
        <div className="mockup-code">
          {text.split("\n").map((line, idx) => (
            <pre data-prefix={idx}>
              <code>{line}</code>
            </pre>
          ))}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
