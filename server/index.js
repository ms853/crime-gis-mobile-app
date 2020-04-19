//starting point of the application.
const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const flash = require('express-flash');
const axios = require('axios');
//application setup 
const app = express();
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

const mongoose = require('mongoose');

const router = require('./router');
//express middleware for incoming requests to be passed into.  
app.use(morgan('combined')); //logging incoming requests.

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: '*/*'})) //parse incoming request is parsed as json. 
router(app); //resolve routes


//Database configuration 
//MongoDB set-up
const connectionString = 'mongodb+srv://mikeDB:supergang19@mymongodbcluster1-yd0ly.gcp.mongodb.net/crimegis?retryWrites=true&w=majority'; 

 mongoose.connect(connectionString, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
     .then(() => {
        console.log("Connected to MongoDB Atlas...");
    }).catch((error) => console.log('Error -> ', error));



//initializing firebase admin authentication object.
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: "https://my-crime-gis-app.firebaseio.com"
});

app.set('views', path.join(__dirname,'views')); //configure the path so it points to the views
app.set('view engine', 'pug'); //Configure the app such that the jade files are rendered.

//display messages on the browser
app.use(flash());

//server setup 
const server = http.createServer(app);


//Callback function to indicate status of the server and where it is listening. 
var port = process.env.PORT || 3000;
  
  server.listen(port, function () {
    console.log('Updated : Server listening at port %d', port);
  }); 
  
     


 
