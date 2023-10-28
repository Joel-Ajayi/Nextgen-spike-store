import { makeSchema, connectionPlugin } from "nexus";
import { join } from "path";
import * as types from "./types/index";

export const userSchema = makeSchema({
  types,
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(__dirname, "/typegen/nexus-typegen.ts"),
    schema: join(__dirname, "schema.graphql"),
  },
  shouldExitAfterGenerateArtifacts: process.argv.includes("--nexusTypegen"),
  contextType: {
    export: "Context",
    alias: "ContextModule",
    module: join(__dirname, "context.ts"),
  },
  features: {
    abstractTypeStrategies: {
      resolveType: false,
    },
  },
});
