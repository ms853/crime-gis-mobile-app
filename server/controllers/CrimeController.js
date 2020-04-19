//https://stackoverflow.com/questions/38421664/fuzzy-searching-with-mongodb - adopted code for the regex.
const CrimeModel = require("../models/crime");
const axios = require('axios');
//const apiURL = "https://data.police.uk/api/outcomes-at-location?";


//Returns all the crimes in the database
exports.getAllCrimes = function(req, res, next) {
    var { totalnumber } = req.params;

    if(!totalnumber) {
        return res.status(422).send({ error: "You need to specify the number of crimes you want to see."})
    }
    const limit = parseInt(totalnumber); //parse the value provided by the client to a number.

    CrimeModel.find({}, function(err, data) {
        if(err) { return next(err); }
        res.status(200).send({ list_of_crimes: data})
    }).sort({ category: 'ascending'}).limit(limit) //limit the result based on the number. 
}

//Regular expression function to handle the search text query.
function escapeRegex(text) {
    return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&");
}

//----------------FUZZY Search Algorithm function-------------//
//SOURCE: https://towardsdatascience.com/natural-language-processing-for-fuzzy-string-matching-with-python-6632b7824c49
//Function for retrieving all the crimes based on search criteria.
//It is sorted based on the relevant matches of the 
exports.searchCrimes = function(req, res, next) {
    
    if(req.query.search) {
        const requestQuery = req.query.search; 
        //res.status(422).send({ error: "You must provide a valid search query."});
        const regexQuery = new RegExp(escapeRegex(requestQuery), 'gi');
        //const search = String(req.query);
        CrimeModel.find({ $text: { $search: regexQuery }},{score: {$meta: "textScore"}})
        .sort({score:{$meta:"textScore"}})
        .limit(10)
        .exec(function(err, crimeDoc) {
            if(err) { return next(err); }
            return res.status(200).send({  result: crimeDoc });
        });
    }else{
        //IF NOT IT WILL RETURN A LIST OF ALL THE CRIMES.
        CrimeModel.find({}, function(err, data) {
            if(err) { return next(err); }
            res.status(200).send({ list_of_crimes: data})
        }).limit(20);
    }

};

//Aggregation
