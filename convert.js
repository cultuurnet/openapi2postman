const $RefParser = require("@apidevtools/json-schema-ref-parser");
const Converter = require('openapi-to-postmanv2');
const util = require('util');

module.exports = async (openApiSchemaFile, environment, customBaseUrl, authOptions, verbose) => {
  const { tokenGrantType, clientId, clientSecret, callbackUrl } = authOptions;
  const environmentSuffix = (environment === 'prod') ? '' : '-' + environment;
  const environmentNameMap = {
    acc: 'Acceptance',
    test: 'Testing',
    prod: 'Production'
  };
  const environmentName = environmentNameMap[environment];

  const log = (message) => {
    if (verbose) {
      console.log(message);
    }
  }

  // Dereference the OpenAPI schema to resolve $refs to schemas in other files.
  log('Dereferencing OpenAPI schema...');
  const deReferencedOpenApiSchema = await $RefParser.dereference(openApiSchemaFile);
  log('Dereferenced OpenAPI schema!');

  // Make the Converter.convert() function (to convert the OpenAPI schema to a Postman collection) work with
  // promises.
  const convert = util.promisify(Converter.convert);

  // Convert the OpenAPI schema into a Postman collection.
  log('Converting OpenAPI schema to Postman v2.1 collection...');
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
  log('Converted OpenAPI schema to Postman v2.1 collection!');

  // Configure authentication (only user access tokens for now).
  log('Adding authentication configuration...');

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
      key: 'oauth2ClientId',
      value: clientId
    },
    {
      key: 'oauth2ClientSecret',
      value: clientSecret
    },
    {
      key: 'oauth2AccessTokenUrl',
      value: 'https://account' + environmentSuffix + '.uitid.be/oauth/token'
    },
  ];
  if (tokenGrantType === 'authorization_code') {
    postmanCollection.variable = postmanCollection.variable.concat([
      {
        key: 'oauth2AuthUrl',
        value: 'https://account' + environmentSuffix + '.uitid.be/authorize?audience=https://api.publiq.be&prompt=login'
      },
      {
        key: 'oauth2RedirectUri',
        value: callbackUrl
      }
    ]);
  }

  // Configure every request to inherit auth from parent (the collection).
  const configureItemToInheritAuthFromParent = (item) => {
    if (item.request) {
      item.request.auth = null;
    }
    if (item.item) {
      item.item = item.item.map(configureItemToInheritAuthFromParent);
    }
    return item;
  };
  postmanCollection.item.map(configureItemToInheritAuthFromParent);

  log('Added authentication configuration!');

  // Configure the base URL for the given environment.
  log('Configuring base url...');
  // Remove the baseUrl set by the Postman converter
  postmanCollection.variable = postmanCollection.variable.filter((variable) => variable.key !== 'baseUrl');
  let baseUrl = '';
  if (customBaseUrl.length > 0) {
    // If a custom base url is given, use that.
    baseUrl = customBaseUrl;
  } else {
    const servers = deReferencedOpenApiSchema.servers ?? [];
    const environmentServer = servers.find((server) => server.description === environmentName);
    const testServer = servers.find((server) => server.description === environmentNameMap.test);
    if (environmentServer) {
      // If a server is found for the given environment in the OpenAPI file, use that server's URL.
      baseUrl = environmentServer.url;
    } else if (environment === 'acc' && testServer) {
      // Otherwise use the test server's URL (if found) and replace the `-test.` suffix with `-acc.`.
      baseUrl = testServer.url.replace('-test.', '-acc.');
    }
  }
  postmanCollection.variable.push({
    key: 'baseUrl',
    value: baseUrl
  });
  if (baseUrl.length > 0) {
    log('Configured base url!');
  } else {
    console.error('Could not configure base URL, no server found in OpenAPI schema for ' + environmentName + ' environment.');
    console.warn('Make sure to configure the correct base URL yourself after importing the Postman collection!');
  }

  return postmanCollection;
}
