This project is React based front end app for AQMS.

## Requirement ##

NodeJS >= v12.16.1

## How to run ##

1. Clone the repo and enter project repo.
2. Instal NVM
```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
```
3. Install node version 
```sh
nvm install v12.16.1
```
4. Install node modules 
```sh
npm install
```
5. Update server IP if needed in config/.env.dev 
6. Run npm command to start the app in development mode
```sh
npm run start:dev
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.


### 'npm start:dev` `npm start:staging` `npm start:production`

Runs the app in the development mode with configuration specfic environment.<br />

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

### 'npm run build:dev` `npm run build:staging` `npm run build:production`

Builds the app based cofig file  and moved to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
