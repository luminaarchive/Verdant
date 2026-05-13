require("../helpers/register-ts.cjs");

const { runPipelineTest } = require("./pipeline.test.ts");

runPipelineTest().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
