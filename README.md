# openapi2postman

This package provides a CLI script to convert OpenAPI files created by publiq to Postman collections.
Additionally it automatically configures the necessary authentication information and base url for all requests.

The script can also be called in a JS runtime environment like NodeJS or a browser.

While it could in theory also be used for OpenAPI files from APIs not created by publiq, this script does make some assumptions like the API using OAuth2 and supporting both tokens from the `authorization_code` flow and `client_credentials` flow.

The authorization server URLs are also hardcoded to those of publiq.

## Usage as CLI script

### Installation

For now, the package can only be installed by cloning this repository.

After cloning it, make sure to install it as a global package.

```
# Checkout the repository
git clone git@github.com:cultuurnet/openapi2postman.git

# Switch to the checked out directory
cd openapi2postman

# Install dependencies
yarn install

# Install as a global npm module
npm install -g .
```

### Usage

```
openapi2postman convert <open-api-file> <client-id> <client-secret> [-o <output file>] [-e <environment>] [-b <base URL>] [-g <token grant type>] [--userAuthCallbackUrl <callback url>]
```

Required arguments:

-  `open-api-file`: Path to a local OpenAPI file
-  `client-id`: Client ID to use for authentication
-  `client-secret`: Client secret to use for authentication

Optional arguments:

- `-o`: File to write the resulting Postman collection to
- `-e`: Environment to use for authentication and base URL. Can be one of `acc`, `test`, or `prod`. Defaults to `test`.
- `-b`: Custom base URL to overwrite the one set automatically by the chosen environment (for example for dev environments) or in case there is no base URL defined for the chosen environment or in the OpenAPI file.
- `-g`: Token grant type to use for authentication. Can be either `client_credentials` for client access tokens, or `authorization_code` for user access tokens. Defaults to `client_credentials`.
- `--userAuthCallbackUrl`: When using the `authorization_code` token grant type a callback URL is required to redirect the user to after login. Postman won't show this redirect, but it is required by OAuth2. The same callback URL has to be configured on the client in Auth0!

**Example with only required arguments**

```
openapi2postman convert my-open-api-file.json MY_CLIENT_ID MY_CLIENT_SECRET
```

This will create a Postman collection based on the given OpenAPI file `my-open-api-file.json`.

The authentication configuration will be set to use the `client_credentials` grant type ("client access tokens") and will use the given `MY_CLIENT_ID` as client id and `MY_CLIENT_SECRET` as client secret.

The Postman collection will be written to the console output.
