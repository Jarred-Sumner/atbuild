const path = require("path");
const Module = require("module");
const fs = require("fs");

export function requireFromString(code, _filename, _require) {
  let filename = _filename;
  if (
    !_filename ||
    path.dirname(_filename) === "" ||
    path.dirname(_filename) === "." ||
    _filename.startsWith(".")
  ) {
    filename = path.join(
      path.dirname(module.parent.id),
      _filename || "atbuild.tmp.js"
    );
  }
  var parent = module.parent;
  if (typeof code !== "string") {
    throw `code must be string, received: ${typeof code}`;
  }

  var paths = Module._nodeModulePaths(path.dirname(filename));
  filename = path.join(
    path.dirname(filename),
    path.basename(filename, path.extname(filename)) + ".js"
  );
  var m = new Module(filename, parent);

  m.filename = filename;
  m.path = path.dirname(filename);
  m.paths = paths.slice().concat(parent.paths);
  m.namespaceCollisionHack = function (arg) {
    return arg;
  };

  m._compile(code, filename);

  if (typeof m.exports === "function") {
    let _requireAtbuild;
    if (typeof _require === "function") {
      _requireAtbuild = async function (id) {
        const code = await _require(id);
        return await requireFromString(code, id);
      };
    } else {
      _requireAtbuild = module.require.bind(module);
    }

    const resp = m.exports(_requireAtbuild);

    if (resp.then) {
      return resp.then(
        (res) => {
          parent &&
            parent.children &&
            parent.children.splice(parent.children.indexOf(m), 1);

          _requireAtbuild = null;
          _require = null;
          m = null;
          return res;
        },
        (err) => {
          _requireAtbuild = null;
          _require = null;
          parent &&
            parent.children &&
            parent.children.splice(parent.children.indexOf(m), 1);
          m = null;
          throw err;
        }
      );
    } else {
      parent &&
        parent.children &&
        parent.children.splice(parent.children.indexOf(m), 1);
      return resp;
    }
  } else {
    const modExports = m.exports;
    parent &&
      parent.children &&
      parent.children.splice(parent.children.indexOf(m), 1);
    m = null;
    return modExports;
  }
}
