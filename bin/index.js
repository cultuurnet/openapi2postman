#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");
const Converter = require('openapi-to-postmanv2');
const util = require('util');

const openApiSchemaFile = './entry.json'; // Hardcoded for now

(
  async () => {
    try {
      // Dereference the OpenAPI schema to resolve $refs to schemas in other files.
      console.log('Dereferencing OpenAPI schema...');
      const deReferencedOpenApiSchema = await $RefParser.dereference(openApiSchemaFile);
      console.log('Dereferenced OpenAPI schema!');

      // Make the Converter.convert() function (to convert the OpenAPI schema to a Postman collection) work with
      // promises.
      const convert = util.promisify(Converter.convert);

      // Convert the OpenAPI schema into a Postman collection.
      console.log('Converting OpenAPI schema to Postman v2.1 collection...');
      const conversion = await convert({type: 'json', data: deReferencedOpenApiSchema}, {});
      if (!conversion.result) {
        throw conversion.reason;
      }
      console.log('Converted OpenAPI schema to Postman v2.1 collection!');
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  }
)();
