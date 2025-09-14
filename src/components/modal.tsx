import { useState, type JSX } from "react";

export function Modal({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}): JSX.Element {
  const [copied, setCopied] = useState(false);

  return (
    <div className="fixed h-full z-10 backdrop-blur-xs w-full flex">
      <div className="w-[80%] h-[80%] justify-center m-auto bg-base-200 p-5 rounded-2xl shadow-2xl items-center content-center">
        <div className="h-full flex flex-col">
          <div className="flex justify-between">
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
              {copied && <p>copied to clipboard!</p>}
            </div>
            <button onClick={onClose} className="btn btn-error">
              x
            </button>
          </div>
          <div className="mockup-code bg-base-100 h-full">
            {text.split("\n").map((line, idx) => (
              <pre data-prefix={idx}>
                <code dangerouslySetInnerHTML={{ __html: line }}></code>
              </pre>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
