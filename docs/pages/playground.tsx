import { Page } from "../components/Page";
import * as React from "react";
import { buildAST, transformAST } from "atbuild/src/full2";
import Link from "next/link";
import { useRouter } from "next/router";
import { format } from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import { Editor } from "../components/Editor";

const ENABLE_PRETTIER = true;

let worker: Worker;
if (typeof window !== "undefined") {
  worker = new Worker("/eval/EvalWorker.worker.js");
}

export async function getStaticProps(context) {
  const { fetchSidebarContent } = require("../components/Sidebar");
  const util = require("util");
  const _glob = require("glob");
  const path = require("path");
  const fs = require("fs");
  const glob = util.promisify(_glob);
  const dir = path.resolve(process.cwd(), "../samples");
  const readFile = util.promisify(fs.readFile);

  const tsbSamples = await glob(dir + "/*.tsb");
  const tsbContent = await Promise.all(
    tsbSamples.map((f) => readFile(f, "utf8"))
  );

  const sidebar = await fetchSidebarContent(fs);

  return {
    props: {
      sidebar,
      tsb: Object.fromEntries(
        tsbContent.map((string, index) => [
          path.basename(tsbSamples[index]),
          string,
        ])
      ),
    }, // will be passed to the page component as props
  };
}

const DEFAULT_FILE = "simple-nested-once.tsb";

enum EditMode {
  code = "build",
  ast = "ast",
  bundle = "bundle",
}

const Tab = ({ children, value, isActive }) => {
  return (
    <Link
      replace
      passHref
      href={{
        pathname: "/playground",
        query: {
          output: value,
        },
      }}
    >
      <a className={`Tab Tab--${isActive ? "active" : "inactive"}`}>
        {children}

        <style jsx>{`
          .Tab {
            font-weight: 500;
            text-transform: uppercase;
            color: white;
            display: flex;
            height: 100%;
            align-items: center;
            padding-left: 12px;
            padding-right: 12px;
            height: 44px;
            border: 1px solid transparent;
            background-color: rgba(255, 255, 255, 0.05);
            z-index: 10;
            position: relative;
          }

          .Tab:hover,
          .Tab--active {
            background-color: rgba(255, 255, 255, 0.2);
          }
          .Tab--active {
            filter: drop-shadow(1px 1px 1px #7d74ff);
          }

          .Tab--inactive {
            border-right-color: rgba(0, 0, 0, 0.5);
          }
        `}</style>
      </a>
    </Link>
  );
};

const CLI_MODE_LABEL = {
  [EditMode.ast]: "--ast --no-bundle",
  [EditMode.code]: "--print --no-bundle",
  [EditMode.bundle]: "--bundle",
};
export const PlaygroundPage = ({ tsb, sidebar }) => {
  const router = useRouter();

  const defaultFile = router.query.file || DEFAULT_FILE;
  const [code, _setCode] = React.useState(tsb[defaultFile]);
  const [error, setError] = React.useState<Error>(null);
  const [evalOutput, setEvalOutput] = React.useState<string>(null);
  const mode = React.useMemo(() => {
    if (
      typeof router.query?.output !== "undefined" &&
      typeof EditMode[router.query?.output] !== "undefined"
    ) {
      return EditMode[router.query?.output];
    } else {
      return EditMode.code;
    }
  }, [router.query.output]);

  const setCode = React.useCallback(
    (code) => {
      setError(null);
      _setCode(code);
    },
    [_setCode, setError]
  );

  const onEval = React.useCallback(
    (event: MessageEvent) => {
      console.log(event.data);
      setEvalOutput(event.data.code);
    },
    [setEvalOutput]
  );

  const onEvalError = React.useCallback(
    (event: ErrorEvent) => {
      console.error(event.error);
      setError(event.error);
    },
    [setError]
  );

  if (typeof window !== "undefined") {
    React.useEffect(() => {
      worker.addEventListener("message", onEval);
      worker.addEventListener("error", onEvalError);
      return () => {
        worker.removeEventListener("message", onEval);
        worker.removeEventListener("error", onEvalError);
      };
    }, [worker, onEval, onEvalError]);
  }

  const onChangeFile = React.useCallback(
    (event) => {
      setCode(tsb[event.target.value]);
      router.replace({
        pathname: router.pathname,
        query: {
          ...router.query,
          file: event.target.value,
        },
      });
    },
    [setCode, router, tsb]
  );

  const lastOutput = React.useRef();

  const ast = React.useMemo(() => {
    try {
      return buildAST(code);
    } catch (exception) {
      setError(exception);
    }
  }, [code, buildAST, setError]);

  const source = React.useMemo(() => {
    if (ast) {
      try {
        return transformAST(ast, code);
      } catch (exception) {
        setError(exception);
      }
    } else {
      return null;
    }
  }, [code, transformAST, setError]);

  React.useEffect(() => {
    if (source && source.length) {
      worker.postMessage({ code: source, ast: ast.toJSON() });
    }
  }, [source, worker, ast]);

  const output = React.useMemo(() => {
    let _output;
    try {
      if (mode == EditMode.code) {
        if (ENABLE_PRETTIER) {
          _output = format(source, { plugins: [parserBabel] }) || source;
        } else {
          _output = source;
        }

        _output = `// This code is executed at build-time and replaced with the contents of ___source___, often making the bundle much smaller. \n\n${_output}`;
      } else if (mode === EditMode.bundle) {
        _output = evalOutput;
      } else {
        _output = buildAST(code, defaultFile).toJSON();
      }
    } catch (exception) {
      setError(exception);
      console.error(exception);
    }

    if (_output) {
      lastOutput.current = _output;
      setError(null);
      return _output;
    } else if (mode === EditMode.code) {
      return lastOutput.current || "";
    } else if (mode === EditMode.ast) {
      return lastOutput.current || {};
    }
  }, [
    code,
    buildAST,
    transformAST,
    source,
    setError,
    mode,
    defaultFile,
    lastOutput,
    evalOutput,
  ]);

  return (
    <Page noScroll sidebar={sidebar} dark={false}>
      <div className="PlaygroundContainer">
        <div className="CodeEditor">
          <div className="HeaderBar">
            <div className="HeaderBar-label">File</div>
            <select onChange={onChangeFile} value={defaultFile}>
              {Object.keys(tsb).map((key) => (
                <option key={key}>{key}</option>
              ))}
            </select>
          </div>

          <div className="ContentView">
            <Editor value={code} onChange={setCode} />
          </div>
        </div>

        <div className="Previewer">
          <div className="HeaderBar HeaderBar--second">
            <div className="TabList">
              <Tab isActive={mode === EditMode.bundle} value={EditMode.bundle}>
                Output
              </Tab>
              <Tab isActive={mode === EditMode.code} value={EditMode.code}>
                Codegen
              </Tab>
              <Tab isActive={mode === EditMode.ast} value={EditMode.ast}>
                AST
              </Tab>
            </div>
          </div>
          <div className="ContentView">
            <Editor
              value={output}
              readOnly
              language={mode === EditMode.ast ? "json" : "typescript"}
            >
              {error && (
                <div className="ErrorView-container">
                  <div className="ErrorView">
                    <div className="ErrorView-Title">{error.name}</div>
                    <div className="ErrorView-Details">{error.stack}</div>
                  </div>
                </div>
              )}
            </Editor>
          </div>

          <div className="Previewer-footer">
            <div className="CodeSample">
              <div className="CodeSample-label">$</div>

              <div className="CodeSample-content">
                atbuild {defaultFile} {CLI_MODE_LABEL[mode]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .PlaygroundContainer {
          display: flex;
          width: 100%;
          height: auto;
          min-height: 100%;
        }

        .CodeSample {
          display: flex;
          background-color: #111;
          color: rgb(0, 255, 0);
          font-family: monospace;
          padding: 12px;
          margin-top: auto;
        }

        .CodeSample-label {
          pointer-events: none;
          padding-right: 12px;
        }

        .CodeEditor,
        .Previewer {
          flex: 1;
          height: auto;
          max-height: calc(100vh);
        }

        .ContentView {
          max-height: calc(100vh);

          width: calc(50vw - (250px / 2));
        }

        .Previewer {
          display: grid;
          grid-template-rows: 44px auto 42px;
        }

        .CodeEditor {
          background-color: white;
        }

        .CodeEditor .ContentView {
          height: calc(100vh - 44px);
        }

        .CodeSample-content {
          user-select: auto;
          -webkit-user-select: auto;
        }

        .HeaderBar {
          display: grid;
          grid-template-columns: min-content 200px;
          grid-column-gap: 16px;
          align-content: center;
          align-items: center;
          padding: 8px 12px;
          background-color: rgba(40, 35, 109, 0.8);
          color: white;
          height: 44px;
        }

        .HeaderBar--second {
          padding-left: 0;
        }

        select {
          padding: 4px;
        }

        .HeaderBar-label {
          text-transform: uppercase;
          font-weight: 500;
        }

        .ErrorView {
          margin: auto;
          margin-top: 32px;
          background-color: white;
          width: 90%;

          border-radius: 10px;
          filter: drop-shadow(1px 1px 3px rgba(0, 0, 0, 0.2));
        }

        .ErrorView-Title {
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 0;
          padding: 12px 16px;
          background-color: rgb(125, 0, 0);
          color: white;
        }

        .ErrorView-Details {
          white-space: pre-line;
          padding: 12px 16px;

          -webkit-line-clamp: 10;
          font-family: monospace;
          line-clamp: 10;
          overflow-y: auto;
        }

        .ErrorView-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background-color: rgba(100, 0, 0, 0.2);
          backdrop-filter: blur(1px);
        }

        .TabList {
          display: grid;
          white-space: nowrap;
          grid-template-columns: min-content min-content min-content;
        }

        .Splitter {
          width: 3px;
          min-height: 100%;
          flex: 0 0 1px;
          background-color: rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </Page>
  );
};

export default PlaygroundPage;
