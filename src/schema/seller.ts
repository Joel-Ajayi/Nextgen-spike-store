import { makeSchema, connectionPlugin } from "nexus";
import { join } from "path";
import * as types from "./types/seller/index";

export const sellerSchema = makeSchema({
  types,
  plugins: [connectionPlugin()],
  outputs: {
    typegen: join(__dirname, "/typegen/seller-nexus-typegen.ts"),
    schema: join(__dirname, "seller.schema.graphql"),
  },
  shouldExitAfterGenerateArtifacts: process.argv.includes("--nexusTypegen"),
  contextType: {
    export: "Context",
    alias: "ContextModule",
    module: join(__dirname, "context.ts"),
  },
});
