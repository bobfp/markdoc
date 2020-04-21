const { createMacro } = require("babel-plugin-macros");
const YAML = require("yaml");
var fs = require("fs");

// `createMacro` is simply a function that ensures your macro is only
// called in the context of a babel transpilation and will throw an
// error with a helpful message if someone does not have babel-plugin-macros
// configured correctly
module.exports = createMacro(myMacro);

function myMacro({ references, state, babel }) {
  references.default.forEach(ref => {
    ref.replaceWith(babel.types.stringLiteral("test"));
    const expressionRoot = ref.parentPath.parentPath;
    const sib = expressionRoot.getSibling(expressionRoot.key + 1);
    const nextConst = sib.node.declarations[0].id.name;
    const md = ref.parentPath.get("quasi").node.quasis[0].value.raw;
    const [_, yamlString, contentString] = /---\n(.*)\n---\n(.*)/.exec(md);
    const frontmatter = YAML.parse(yamlString);
    const updatedFM = Object.assign({}, frontmatter, { name: nextConst });
    ref.parentPath.remove();
    fs.writeFile(
      state.file.opts.root + "/dist/sample.md",
      `---\n${YAML.stringify(updatedFM)}\n---\n${contentString}`,
      function(err) {
        if (err) throw err;
      }
    );
  });
}
