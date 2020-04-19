const Authentication = require('./controllers/AuthenticationController');
const Report = require('./controllers/ReportController');
const Crime = require('./controllers/CrimeController');
const CrimeModel = require("./models/crime");

const axios = require('axios');
//export module functions.
//typical get request function. 
module.exports = function(app) {
	//for debug
     app.get('/', function(req, res, next) {
         //res.send(['Mike','Spike','Like']);
         res.render('index', {
             title: 'Express',
             user: req.user
         })
     });

     app.get('/login', function(req, res) {
        res.render('login', {
          user: req.user
        });
      });

      app.get('/signup', function(req, res) {
        res.render('signup', {
          user: req.user
        });
      });

      app.get('/forgot', function(req, res) {
        res.render('forgot', {
          user: req.user
        });
      });

     
    //const crimeAtLocationAPI = "https://data.police.uk/api/crimes-at-location?";
    
    
    app.post('/api/signup', Authentication.signup);
    app.post('/api/login', Authentication.login);
    //route for handling forgotten password.
    app.post('/forgot', Authentication.forgottenPassword);
    //reset password page requires a token to be accessed. 
    app.get('/reset/:token', Authentication.navigateToResetPassword);
    app.post('/reset/:token', Authentication.reqPasswordReset);
    
    //get a specific user
    app.get('/userid/:username', Report.getUserId); 
    
    //Router configurations for api endpoint
    //requests for Report CRUD Functionality
    app.post('/api/reportcrimeanonymously/', Report.reportCrimeAnonymously);
    app.post('/api/reportnewcrime/:userId', Report.reportNewCrimeByUser);
    app.get('/api/getcrimereports/:userId', Report.getCrimeReportsByUser);
    app.put('/api/editcrimereport/:crimeId', Report.editCrimeReport);
    app.delete('/api/deletereport/:crimeId', Report.deleteCrimeReport);
    
    //API request endpoint for getting all the crimes in a custom area in leicester.
    app.get('/api/crimes/:totalnumber', Crime.getAllCrimes);
    
    app.get('/api/searchcrimes?', Crime.searchCrimes);
    

      
        
        //Method for populating the database with current crime records from 2019.
        //Involves a network request made to the api. 
        var downloadCrimes = function (url) {
        var crimeDoc = null;      
        axios.get(url, { 
            params: {
                date: "2019-01",
                poly: "52.640,-1.186:52.640,-1.201:52.631,-1.201:52.631,-1.186"
            }
        }).then((result) => {
            var { data } = result;
            console.log(data);
            //Saving multiple crimes all at once. 
            data.forEach(function(element) {
              crimeDoc = new CrimeModel({

                category: element.crime.category,
                //context: element.crime.context,
                location_type: element.crime.location_type,
                latitude: element.crime.location.latitude,
                longitude: element.crime.location.longitude, 
                street_name: element.crime.location.street.name,
                date: element.crime.month,  
              });
              crimeDoc.save(function(err) {
                if(err) throw err;
              });
            })

          })
        .catch((error) => console.log('error -> ', error));
      };
      //const apiURL = "https://data.police.uk/api/outcomes-at-location?";
      //downloadCrimes(apiURL); 

}
 