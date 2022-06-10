import { makeSchema, connectionPlugin, declarativeWrappingPlugin } from "nexus";
import { join } from "path";
import * as types from "./types/index";

export const schema = makeSchema({
  types,
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(__dirname, "nexus-typegen.ts"),
    schema: join(__dirname, "schema.graphql"),
  },
  shouldExitAfterGenerateArtifacts: process.argv.includes("--nexusTypegen"),
  contextType: {
    export: "Context",
    alias: "ContextModule",
    module: join(__dirname, "context.ts"),
  },
});
