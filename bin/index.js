#!/usr/bin/env node

const $RefParser = require("@apidevtools/json-schema-ref-parser");
const Converter = require('openapi-to-postmanv2');
const util = require('util');
const fs = require('fs');

const openApiSchemaFile = './entry.json'; // Hardcoded for now
const postmanCollectionFile = './entry-postman.json'; // Hardcoded for now

const baseUrl = 'http://io-acc.uitdatabank.be'; // // Dependent on environment. Hardcoded for now.
const tokenGrantType = 'authorization_code'; // Hardcoded for now. Sensible default would be `client_credentials`.
const authorizeUrl = 'https://account-acc.uitid.be/authorize?audience=https://api.publiq.be&prompt=login'; // Dependent on environment. Hardcoded for now.
const accessTokenUrl = 'https://account-acc.uitid.be/oauth/token'; // Dependent on environment. Hardcoded for now.
const clientId = 'mock'; // Hardcoded for now.
const clientSecret = 'mock'; // Hardcoded for now.
const callbackUrl = 'https://jwt-acc.uitdatabank.be/authorize'; // Hardcoded for now.

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

      // Configure authentication (only user access tokens for now).
      console.log('Adding authentication configuration...');

      postmanCollection.auth = {
        type: "oauth2",
        oauth2: [
          {
            key: "grant_type",
            value: tokenGrantType,
            type: "string"
          },
          {
            key: "tokenName",
            value: tokenGrantType === 'authorization_code' ? 'User access token' : 'Client access token',
            type: "string"
          },
          {
            key: "challengeAlgorithm",
            value: "S256",
            type: "string"
          },
          {
            key: "accessTokenUrl",
            value: "{{oauth2AccessTokenUrl}}",
            type: "string"
          },
          {
            key: "clientId",
            value: "{{oauth2ClientId}}",
            type: "string"
          },
          {
            key: "clientSecret",
            value: "{{oauth2ClientSecret}}",
            type: "string"
          },
          {
            key: "addTokenTo",
            value: "header",
            type: "string"
          },
          {
            key: "client_authentication",
            value: "header",
            type: "string"
          }
        ]
      };
      if (tokenGrantType === 'authorization_code') {
        postmanCollection.auth.oauth2 = postmanCollection.auth.oauth2.concat([
          {
            key: "authUrl",
            value: "{{oauth2AuthUrl}}",
            type: "string"
          },
          {
            key: "redirect_uri",
            value: "{{oauth2RedirectUri}}",
            type: "string"
          }
        ]);
      }

      // Set authentication variables
      postmanCollection.variable = [
        {
          key: 'baseUrl',
          value: baseUrl
        },
        {
          key: 'oauth2ClientId',
          value: clientId
        },
        {
          key: 'oauth2ClientSecret',
          value: clientSecret
        },
        {
          key: 'oauth2AccessTokenUrl',
          value: accessTokenUrl
        },
      ];
      if (tokenGrantType === 'authorization_code') {
        postmanCollection.variable = postmanCollection.variable.concat([
          {
            key: 'oauth2AuthUrl',
            value: authorizeUrl
          },
          {
            key: 'oauth2RedirectUri',
            value: callbackUrl
          }
        ]);
      }

      console.log('Added authentication configuration!');

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
