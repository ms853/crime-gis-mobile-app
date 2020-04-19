const mongoose = require('mongoose'); 
const Schema = mongoose.Schema;

//Separate schema for storing hystorical crime data obtained from data.police.uk.
const CrimeSchema = new Schema({
    category: { type: String, required: true, index: true, text: true},
    //context: String, //that will store extra information about the crime.
    location_type: String,
    latitude: String,
    longitude: String,
    street_name: {type: String, required: true},
    date: {type: String, index: true, text: true}

});

CrimeSchema.index({category: "text", date: "text"});

const CrimeModel = mongoose.model('crime', CrimeSchema);
module.exports = CrimeModel;

