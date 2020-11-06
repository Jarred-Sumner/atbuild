import * as React from "react";
import useComponentSize from "@rehooks/component-size";
import dynamic from "next/dynamic";

if (typeof window !== "undefined" && typeof ResizeObserver === "undefined") {
  require("resize-observer-polyfill");
}

const MonacoEditor = dynamic(import("react-monaco-editor"), { ssr: false });
const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
});

function onMonacoMount() {
  window.MonacoEnvironment.getWorkerUrl = (
    _moduleId: string,
    label: string
  ) => {
    if (label === "json") return "_next/static/json.worker.js";
    if (label === "css") return "_next/static/css.worker.js";
    if (label === "html") return "_next/static/html.worker.js";
    if (label === "typescript" || label === "javascript")
      return "_next/static/ts.worker.js";
    return "_next/static/editor.worker.js";
  };
}

const MONACO_OPTIONS = {
  minimap: {
    enabled: false,
  },
};

export const Editor = React.memo(
  ({ value, onChange, language = "typescript", readOnly, children }) => {
    let ref = React.useRef(null);
    const { width, height } = useComponentSize(ref);

    return (
      <div ref={ref} className={`EditorWrapper EditorWrapper--${language}`}>
        {language === "json" ? (
          <ReactJson src={value} />
        ) : (
          <MonacoEditor
            width={width}
            editorDidMount={onMonacoMount}
            height={height}
            language={language}
            theme="vs-light"
            value={value}
            options={MONACO_OPTIONS}
            onChange={onChange}
          />
        )}
        {children}
        <style jsx>{`
          .EditorWrapper {
            display: flex;
            flex: 1;
            height: 100%;
            position: relative;
          }

          .EditorWrapper--json {
            overflow: auto;
            max-height: calc(100vh - 44px - 38px);
          }
        `}</style>
      </div>
    );
  }
);

export default Editor;
