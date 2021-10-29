#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");

const openApiSchemaFile = './entry.json'; // Hardcoded for now

(
  async () => {
    try {
      // Dereference the OpenAPI schema to resolve $refs to schemas in other files.
      const deReferencedOpenApiSchema = await $RefParser.dereference(openApiSchemaFile);
      console.log(JSON.stringify(deReferencedOpenApiSchema, null, 2));
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  }
)();
