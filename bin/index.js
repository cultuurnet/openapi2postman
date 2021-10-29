#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");

const openApiSchemaFile = './entry.json'; // Hardcoded for now

(
  async () => {
    try {
      let deReferenced = await $RefParser.dereference(openApiSchemaFile);
      console.log(JSON.stringify(deReferenced, null, 2));
    } catch(err) {
      console.error(err);
    }
  }
)();
