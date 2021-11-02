# openapi2postman

This package provides a CLI script to convert OpenAPI files created by publiq to Postman collections.
Additionally it automatically configures the necessary authentication information and base url for all requests.

The script can also be called in a JS runtime environment like NodeJS or a browser.

While it could in theory also be used for OpenAPI files from APIs not created by publiq, this script does make some assumptions like the API using OAuth2 and supporting both tokens from the `authorization_code` flow and `client_credentials` flow.

The authorization server URLs are also hardcoded to those of publiq.

## Usage as CLI script

### Requirements

- node (14+ recommended) and npm ([https://nodejs.org/en/](https://nodejs.org/en/)) (you can use [nvm](https://github.com/nvm-sh/nvm) to switch between multiple versions if needed)
- yarn ([https://yarnpkg.com/](https://yarnpkg.com/))

### Installation

For now, the package can only be installed by cloning this repository.

```
# Checkout the repository
git clone git@github.com:cultuurnet/openapi2postman.git

# Switch to the checked out directory
cd openapi2postman

# Install dependencies
yarn install

# Install as a global npm module
npm install -g .

# Verify that it works (should be executable from any directory)
openapi2postman --help
```

### Usage

```
openapi2postman convert <open-api-file> <client-id> <client-secret> [-o <output file>] [-e <environment>] [-b <base URL>] [-g <token grant type>] [--userAuthCallbackUrl <callback url>]
```

Required arguments:

-  `open-api-file`: Path or URL to an OpenAPI file
-  `client-id`: Client ID to use for authentication
-  `client-secret`: Client secret to use for authentication

Optional arguments:

- `-o` or `--outputFileName`: File to write the resulting Postman collection to
- `-e` or `--environment`: Environment to use for authentication and base URL. Can be one of `acc`, `test`, or `prod`. Defaults to `test`.
- `-b` or `--baseUrl`: Custom base URL to overwrite the one set automatically by the chosen environment (for example for dev environments) or in case there is no base URL defined for the chosen environment or in the OpenAPI file.
- `-g` or `--tokenGrantType`: Token grant type to use for authentication. Can be either `client_credentials` for client access tokens, or `authorization_code` for user access tokens. Defaults to `client_credentials`.
- `--userAuthCallbackUrl`: When using the `authorization_code` token grant type a callback URL is required to redirect the user to after login. Postman won't show this redirect, but it is required by OAuth2. The same callback URL has to be configured on the client in Auth0!
- `-p` or `--prettyPrint`: Includes newlines and indentation (2 spaces) in the output for readability.

#### Example with only required arguments

```
openapi2postman convert my-open-api-file.json MY_CLIENT_ID MY_CLIENT_SECRET
```

This will create a Postman collection based on the given OpenAPI file `my-open-api-file.json`.

The authentication configuration will be set to use the `client_credentials` grant type ("client access tokens") and will use the given `MY_CLIENT_ID` as client id and `MY_CLIENT_SECRET` as client secret.

The Postman collection will be written to the console output.

#### Writing the output to a file

Use the `-o` options to specify a file name to write the output to instead of the console output.

```
openapi2postman convert my-open-api-file.json MY_CLIENT_ID MY_CLIENT_SECRET -o postman.json
```

The Postman collection will now be saved to a `postman.json` file that you can import in Postman.

#### Examples with real API URLs

Instead of using a local OpenAPI file, you can also use a URL that points to an OpenAPI file.

UiTdatabank Entry API:
```
openapi2postman convert 'https://stoplight.io/api/v1/projects/publiq/uitdatabank/nodes/reference/entry.json?deref=optimizedBundle' MY_CLIENT_ID MY_CLIENT_SECRET -o uitdatabank.entry.postman.json
```

UiTPAS API:
```
openapi2postman convert 'https://stoplight.io/api/v1/projects/publiq/uitpas/nodes/reference/UiTPAS.v2.json?deref=optimizedBundle' MY_CLIENT_ID MY_CLIENT_SECRET -o uitpas.postman.json
```

(The example URLs above point to the OpenAPI files for the "Stable" branches of the APIs' documentation.)

## Importing in Postman

After you have used `openapi2postman` to generate a JSON file with a Postman collection, you can import it by clicking `File > Import` (`command+O` or `ctrl+O`) and dragging and dropping your file into the modal that opened. 
