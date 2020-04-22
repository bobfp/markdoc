const { createMacro } = require("babel-plugin-macros");
const YAML = require("yaml");
var fs = require("fs");

const getExplicitFields = ref => {
  const s = ref.parentPath.get("quasi").node.quasis[0].value.raw;
  const [_, yamlString, contentString] = /---\n(.*)\n---\n(.*)/.exec(s);
  return { frontmatter: YAML.parse(yamlString), content: contentString };
};

const getImplicitFields = (ref, state) => {
  const expressionRoot = ref.parentPath.parentPath;
  const sib = expressionRoot.getSibling(expressionRoot.key + 1);
  const name = sib.node.declarations[0].id.name;
  const filePath = state.file.opts.root + `/dist/sample/${name}.md`;
  return { name, filePath };
};

const generateFileData = block => ({
  path: block.implicitFields.filePath,
  content: `---\n${YAML.stringify({
    ...block.explicitFields.frontmatter,
    name: block.implicitFields.name
  })}\n---\n${block.explicitFields.content}`
});

const writeFile = file =>
  fs.writeFile(file.path, file.content, err => {
    if (err) throw err;
  });

const transformMacro = ref => {
  ref.parentPath.remove();
};

const doc = ({ references, state, babel }) => {
  // get all occurances of the macro
  const docs = references.default;

  // map over to build out block md info
  const blocks = docs.map(doc => ({
    implicitFields: getImplicitFields(doc, state),
    explicitFields: getExplicitFields(doc)
  }));
  const fileStrings = blocks.map(generateFileData);

  // write files
  fileStrings.forEach(writeFile);

  //remove macro from js
  docs.forEach(transformMacro);
};

module.exports = createMacro(doc);
