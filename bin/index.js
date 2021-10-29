#!/usr/bin/env node

const convert = require('../convert.js');
const fs = require('fs');

const openApiSchemaFile = './entry.json';
const postmanCollectionFile = './entry-postman.json';

const environment = 'test';

const authOptions = {
  tokenGrantType: 'client_credentials',
  clientId: 'mock',
  clientSecret: 'mock',
  callbackUrl: 'https://jwt-test.uitdatabank.be/authorize'
}

convert(openApiSchemaFile, environment, authOptions).then((postmanCollection) => {
  console.log('Writing Postman v2.1 collection to file...');
  fs.writeFileSync(postmanCollectionFile, JSON.stringify(postmanCollection, null, 2));
  console.log('Wrote Postman v2.1 collection to file!');
});
