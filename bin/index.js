#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");
const Converter = require('openapi-to-postmanv2');
const util = require('util');

const openApiSchemaFile = './entry.json'; // Hardcoded for now

(
  async () => {
    try {
      // Dereference the OpenAPI schema to resolve $refs to schemas in other files.
      const deReferencedOpenApiSchema = await $RefParser.dereference(openApiSchemaFile);
      console.log(JSON.stringify(deReferencedOpenApiSchema, null, 2));

      // Make the Converter.convert() function (to convert the OpenAPI schema to a Postman collection) work with
      // promises.
      const convert = util.promisify(Converter.convert);

      // Convert the OpenAPI schema into a Postman collection.
      const conversion = await convert({type: 'json', data: deReferencedOpenApiSchema}, {});
      console.log(conversion);
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  }
)();
