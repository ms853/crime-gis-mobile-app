//https://stackoverflow.com/questions/14588032/mongoose-password-hashing

const mongoose = require('mongoose'); 
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;


//Define user model
const UserSchema = new Schema({
    email: { type:String, unique: true, lowercase: true }, //enforce uniqueness on the email.
    username: { type: String, required: true, unique: true}, //username will be generated for the user at runtime. 
    password: { type:String, required: true},
    phone: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    crime_reports: [{ type: Schema.Types.ObjectId, ref: 'crime_report' }] //crime reports references, to depict one-to-many relationship. 

})

//before saving the user model, encrypt the users password. 
UserSchema.pre('save', function(next) {
    
    if(!this.isModified()) {
        return next();
    }

    this.password = bcrypt.hashSync(this.password, 10); //synchronosly hash the password with 10 being the length of the salt generated.
    next();
      
});

UserSchema.methods.verifyPassword = function(plaintextPwd, callback) {
    return callback(null, bcrypt.compareSync(plaintextPwd, this.password));
};

UserSchema.methods.setPassword = function(newPassword, cb) {
    return cb(null, this.password = newPassword);
}


//create model class which represents all users.
//This loads the schema into mongoose and it tells mongoose that there's a new schema here it's about a user.
//The user corresponds to a collection named user. 
const UserModel = mongoose.model('user', UserSchema);

//export model 
module.exports = UserModel;