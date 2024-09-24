This project is Node based back end app for AQMS.

## Requirement ##

NodeJS >= v12.16.1
MongoDB >= 4.2

## How to run ##

1. Clone the repo and enter project repo.
2. Instal NVM
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
3. Install node version 
```sh
nvm install v8.11.4
npm install pm2@4.2.3 -g
npm i
```
4. Install MongoDB
5. Add Database ESBHADB and `users` collection with below user entry
```
{
    "role":"Super Admin",
    "userName":"sudo",
    "password":"sudo123"
}
``` 
6. Run node command to start the app in development mode
```sh
export FRONTEND_APP_PATH=frontend_app_path
npx shipit dev startDev //start app with forntend build
npx shipit dev_PBMS startDev //start app with forntend build

or

npm run start:dev //to start server only
npm run start:dev_PBMS //to start server only

or

npx shipit dev devDocker //to start using docker
```
7. Add Device in device management page
8. Use AQMS.postman_collection.json for add live data enrty

## Deployment ##
```sh
export GIT_USERNAME=git_username //required
export GIT_TOKEN=git_token //required
export GIT_BRANCH=git_branch //Defualt master
export FRONTEND_APP_BRANCH=git_frontend_app_branch //Defualt master
npx shipit ENV deploy

EX: npx shipit staging deploy
EX: npx shipit staging_PBMS deploy

//Docker
npx shipit ENV deployDocker

EX: npx shipit staging deployDocker
EX: npx shipit staging_PBMS deployDocker

OR

//To deploy development code 
export FRONTEND_APP_PATH=frontend_app_path
export DEPLOY_SERVER=server_username@host //Defualt staging instance
export BUILD_CMD=node_app_build_cmd //Defualt build:staging
export FRONTENT_APP_BUILD_CMD=frontend_app_build_cmd //Defualt build:staging
export DOCKER_BUILD_CMD=docker_build_cmd //Defualt build:staging_docker,Required if docker deployment
npx shipit dev_deploy deploy

//Docker
npx shipit dev_deploy deployDocker

```