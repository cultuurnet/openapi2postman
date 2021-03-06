#!/usr/bin/env node

const yargs = require('yargs');
const convert = require('../convert.js');
const fs = require('fs');

const convertWithArgv = (argv) => {
  const {openApiSchemaFile, environment, baseUrl, outputFileName, prettyPrint} = argv;
  const authOptions = {
    tokenGrantType: argv.tokenGrantType,
    clientId: argv.clientId,
    clientSecret: argv.clientSecret,
    authPerRequest: argv.authPerRequest
  };

  if (authOptions.tokenGrantType === 'authorization_code') {
    const {userAuthCallbackUrl} = argv;
    authOptions.callbackUrl = userAuthCallbackUrl;
  }

  const verbose = outputFileName.length > 0;

  convert(openApiSchemaFile, environment, baseUrl, authOptions, verbose)
    .then((postmanCollection) => {
      const stringified = JSON.stringify(postmanCollection, null, prettyPrint ? 2 : 0);
      if (outputFileName.length > 0) {
        console.log('Writing Postman v2.1 collection to file...');
        fs.writeFileSync(outputFileName, stringified);
        console.log('Wrote Postman v2.1 collection to file!');
      } else {
        console.log(stringified);
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
  ;
}

yargs
  .scriptName("openapi2postman")
  .usage('$0 <cmd> [args]')
  .command(
    'convert <openApiSchemaFile> <clientId> <clientSecret> [environment] [baseUrl] [tokenGrantType] [userAuthCallbackUrl] [outputFileName] [prettyPrint]',
    'Convert an OpenAPI schema file to a Postman collection and configure it for integrators',
    (yargs) => {
      yargs.positional('openApiSchemaFile', {
        type: 'string',
        describe: 'the OpenAPI file to convert'
      });
      yargs.positional('clientId', {
        type: 'string',
        describe: 'the client\'s id to use for authentication'
      });
      yargs.positional('clientSecret', {
        type: 'string',
        describe: 'the client\'s secret to use for authentication'
      });
      yargs.option('environment', {
        alias: 'e',
        default: 'test',
        choices: ['acc', 'test', 'prod'],
        describe: 'the API\'s server environment to use as base URL for all requests',
        type: 'string'
      });
      yargs.option('baseUrl', {
        alias: 'b',
        default: '',
        describe: 'allows you to manually specify the baseUrl, for example for development environments',
        type: 'string'
      });
      yargs.option('tokenGrantType', {
        alias: 'g',
        default: 'client_credentials',
        choices: ['client_credentials', 'authorization_code'],
        describe: 'the grant type to use to get tokens from the authorization server',
        type: 'string'
      });
      yargs.option('userAuthCallbackUrl', {
        default: '',
        describe: 'the callback url to use when using the authorization_code grant type',
        type: 'string'
      });
      yargs.option('authPerRequest', {
        default: false,
        describe: 'configures authorization settings per request instead of globally',
        type: 'boolean'
      });
      yargs.option('outputFileName', {
        alias: 'o',
        default: '',
        describe: 'allows you to store the output in a file',
        type: 'string'
      });
      yargs.option('prettyPrint', {
        alias: 'p',
        default: false,
        describe: 'makes the Postman collection use newlines and indentation (2 spaces)',
        type: 'boolean'
      });
    },
    convertWithArgv
  )
  .help()
  .argv;
