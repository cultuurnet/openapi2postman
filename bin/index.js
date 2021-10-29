#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");
const Converter = require('openapi-to-postmanv2');
const util = require('util');
const fs = require('fs');

const openApiSchemaFile = './entry.json'; // Hardcoded for now
const postmanCollectionFile = './entry-postman.json'; // Hardcoded for now

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
      const conversionInput = {type: 'json', data: deReferencedOpenApiSchema};
      const conversionOptions = {
        folderStrategy: 'Tags',
        collapseFolders: false
      };
      const conversion = await convert(conversionInput, conversionOptions);
      if (!conversion.result) {
        throw conversion.reason;
      }
      const postmanCollection = conversion.output[0].data;
      console.log('Converted OpenAPI schema to Postman v2.1 collection!');

      // Write Postman collection to file.
      console.log('Writing Postman v2.1 collection to file...');
      fs.writeFileSync(postmanCollectionFile, JSON.stringify(postmanCollection, null, 2));
      console.log('Wrote Postman v2.1 collection to file!');
    } catch(err) {
      console.error(err);
      process.exit(1);
    }
  }
)();
