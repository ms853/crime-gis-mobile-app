const ReportModel = require('../models/report');
const UserModel = require('../models/user');
const mongoose = require('mongoose');
const crypto = require('crypto');

//function for requesting user's user id. 
exports.getUserId = function(req, res, next) {
    const { username } = req.params;
    if(!username) { return res.status(422).send({ error: 'A valid username must be provided'})}
    
    //Now find the user based on their user id. 
    const user = UserModel.findOne({ username: username }, function(err, userDoc) {
        if(err) { return next(err);}
        return res.status(200).send({ userId: userDoc._id.toString() });
     });
};

function generateHexdecimal(number) {
    return crypto.randomBytes(number).toString('hex');
}

exports.reportCrimeAnonymously = function(req, res, next) {
    
    if(!req.body.type || !req.body.date || !req.body.time || !req.body.address) { 
        return res.status(422).send({error: 'You must provide a valid date/time/type of crime!'});
    }

    const { date, description, address, type, time, answer1, answer2, answer3 } = req.body;

    var answerArr = [];
    answerArr.push(answer1,answer2,answer3); //push the answers to the array. 

     const newReport = new ReportModel({
        typeOfCrime: type,
        date: date,
        description: description,
        time: time,
        address: address,
        answers_to_questions: answerArr
    }); //create a new model with the data provide from the request body.

    //save new report
    newReport.save(function(err) {
        if(err) { return next(error);}
        return res.status(201).send({
            success:true,
            msg: 'Report submitted anonymously!',
            crime_report: newReport //send the document to the user.
        });
    });

};

//https://stackoverflow.com/questions/24466366/mongoose-rangeerror-maximum-call-stack-size-exceeded - link that helped me debug range error bug
//HTTP POST
exports.reportNewCrimeByUser = function(req, res, next) {
    
    var { userId } = req.params; //get user id from the parameter
    
    if(!req.body.type || !req.body.date || !req.body.time || !req.body.address) { 
        return res.status(422).send({error: 'You must provide a valid date/time/type of crime!'});
    }

    const { date, description, address, type, time, answer1, answer2, answer3 } = req.body;
     
    var answerArr = [];
    answerArr.push(answer1,answer2,answer3); //push the answers to the array. 

     const newReport = new ReportModel({
        typeOfCrime: type,
        date: date,
        description: description,
        time: time,
        address: address,
        answers_to_questions: answerArr
     }); //create a new model with the data provide from the request body. 
     
     //Now find the user based on their user id. 

        UserModel.findById(userId, function(err, user) {
            if(err) { return next(err);}  

            newReport.user = user; //set the reference of the user id to the new report document.
   
            //save new report
            newReport.save(function(err) {
                if(err) { return next(error);}
            });
            //Note that I have converted the report document to an object, ready to be saved.
            user.crime_reports.push(newReport.toObject()); //save reference of crime report to the user collection.
       
            user.save(function(err) {
            if(err) { return next(error);}
            });
       
        return res.status(201).send({ success: true, 
            report_created: newReport, 
            updated_user: user
        });
    });

       
};

//HTTP GET
exports.getCrimeReportsByUser = function(req, res, next) {
    const { userId } = req.params; //using es6 destructuring to retrieve the user id from the request parameter.
    if(!userId) { return res.status(422).send({ error: "You must provide a valid user account"})}

    const user = UserModel.findById(userId, function(err, user) {
        if(err) { next(err)}; //handle the error.
    }).populate('crime_reports').limit(10);
    //console.log()
    user.then((user) => {
        res.status(200).json(user.crime_reports);
    });
};

//HTTP PUT
exports.editCrimeReport = function(req, res, next) {
    const { crimeId } = req.params;
    const { description, type, date, time } = req.body; //destructuring variables from the request body object.

    if(!crimeId) { return res.status(422).send({ error: "You need to provide both the user id and crime id you want to edit."})}
    //search for the particular report and update it.
    ReportModel.findByIdAndUpdate(crimeId, 
        { $set: 
            { 
                typeOfCrime: type,
                date: date,
                description: description,
                time: time,
            }
        }, function(err, report){
        if(err) { next(err); }
        //save report document
        report.save(function(err){
            if(err) throw err;
        }); 
        return res.status(200).send({
            success:true,
            msg: "successfully updated the report record", 
            updated_report: report
        });
    });
    
};

//HTTP DELETE
exports.deleteCrimeReport = function(req, res, next) {
    const { crimeId } = req.params;
    if(!crimeId) { return res.status(422).send({ error: "You must provide a valid crime id!"})}

    ReportModel.findOneAndDelete({ _id: crimeId}, function(err, report) {
        if(err) { next(err); }
        return res.status(200).send({ msg: "report deleted", deleted_report: report});
    });

};


function downloadCrimes(url) {
    var result = null;
    fetch(url, {method: 'GET'})
    .then((response) => { return response.json()})
    .then((data) => console.log(data))
    .catch((error) => console.log('error -> ', error));
};