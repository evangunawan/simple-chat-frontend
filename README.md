# Chat Frontend

## About
This application is built as a support for [simple-chat-backend](https://github.com/evangunawan/simple-chat-backend) API.
You can run and use this web application as a demo to enter and send chat messages.

## Running
### Prerequisites
Make sure to run this Angular application using Node v16 above.
You also need angular cli and ionic cli to run this application.
Install them using `npm install -g @ionic/cli @angular/cli`.

### Installation
Clone this repository and install dependencies using npm using this command
```bash
$ npm install
```

### Development Server
This application built using Ionic Framework. To run a development server you can use
```bash
$ ionic serve
```
This will run your application and launch a web browser at `http://localhost:8100`.

### Build Production
You can also bundle and build this application to be served on a serverless production environment.
Build the application using
```bash
$ ionic build --prod
```
Which will build and bundle your application into `./www` directory.
