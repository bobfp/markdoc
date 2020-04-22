import doc from "../src/doc.macro";

doc`
---
spec: doDouble
---
Doubles a number
`;
const double = x => x * 2;

doc`
---
spec: doAdd
---
Adds two numbers together
`;
const add = (a, b) => a + b;
