const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const user = require("./user");

//Define crime reports schema that will relate to the user. 
const  CrimeReportSchema = new Schema({
    typeOfCrime: { type: String, required: true},
    description: {type: String, required: true},
    address: {type:String, required: true},
    date: {type: String, required: true},
    time: { type: String, required: true},
    answers_to_questions: { type: [String], required: true},
    user: { //reference to the user (one to may relationship between users and reports.)
        type: Schema.Types.ObjectId,
        ref: 'user'
    }

});

const ReportModel = mongoose.model('crime_report', CrimeReportSchema); //create crime report model. 
module.exports = ReportModel; //export module. 

