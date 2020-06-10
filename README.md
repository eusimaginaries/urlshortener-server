# URL Shortener Server # 
This repository stores the source code for the Govtech assessment: URL Shortener.

## Requirements ##
### Basic ###
1. As a shortened URL creator, I want to shorten a normal URL to a shortened one, so that I can
have a shorter URL to disseminate.
```
Sample request: www.google.com
Sample response: sho.rt/sdf87sf
```
2. As a shortened URL consumer, I want to click on a shortened URL and have it arrive at the
full URL without further clicks, so that I can type less into my browser.
### Bonus ###
1. A simple frontend with an input box for entering the URL to be shortened
2. Deploy the web application to a publicly accessible hosting service
3. Persistence of the shortened URLs across system reboots (e.g. relational databases like
MySQL)
4. Write 1 or 2 unit tests to demonstrate you understand how to write automated tests

## Scripts ##
1. `yarn build` Builds the typescript source file into the _dist_ folder.
2. `yarn deploy` Deploys to aws services.
3. `yarn test` Run functional tests scripts.

## Deploying ##
This application leverages on serverless to deploy to AWS.
1. Create access keys to be able to communicate with AWS.
2. Insert the keys into `aws-secret.sh` using _aws-secret-sample.sh_ as template
3. Perform `yarn deploy`.

## API ##
- Retrieve previously queried entries (paged: default size 10)
```
GET .../entries
```
- Retrieve the url using the id.
```
GET .../entries/:id
```
- Create a new entry if original url is not queried before.
```
POST .../entries
BODY {
  "url": {url with http https}
}

## Issues ##
Due to dynamodb usage, it seems that write operations only shows up 1 transaction later. More investigations will be required.