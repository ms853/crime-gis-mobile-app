const admin = require('firebase-admin');
const googleAuth = require('../account');
const UserClass = require('../models/user');
const crypto = require('crypto');
const nodeMail = require('nodemailer');
const async = require('async');
//const oneTimePassword = require('./requestOneTimePassword');

exports.signup = function(req, res, next) {
    //Verify the user provided a phone.

    if (!req.body.email || !req.body.password || !req.body.phone) {
       return res.status(422).send({ error: 'Bad Input!' + ' Please, to sign up, provide a valid credentials.'});
    }
  
   //With regex expression format users phone-number to remove dashes and parenthesis.
   
   const email = req.body.email;
   const password = req.body.password;
   const phone = String(req.body.phone).replace(/[^\d]/g, '');
 
   //check if a user with that email already exists.
   UserClass.findOne({ email: email }, function(error, userExists) {
     if(error) { return next(error);}
      //if there is an existing user with that email, then return an error.
     if(userExists) {
       return res.status(422).send({ error: "A user already exists with that email address."});
     }

     //otherwise a new user is created.
     const newUser = new UserClass({
        email: email,
        username: email.substring(0, email.lastIndexOf("@")), //username is generated by applying the substring method on the email address.
        password: password,
        phone: phone
     });

     //save user to the database
     newUser.save(function(error) {
       if(error) { return next(error);}

      return res.send({ success: true, user_created: newUser });

     });

   }); 

};

exports.login = function(req, res, next) {
    
  if (!req.body.username || !req.body.password) {
      return res.status(422).send({ error: 'Email and password must be provided'});
  }
  //store the username and password fields as variables
  const username = req.body.username;
  const password = req.body.password;
  

  
  //mongodb query to fetch user by username.
  var user = UserClass.findOne({ username: username }).exec();
  
  //if user doesn't exist handle error.
  if(!user) { 
    return res.status(400).send({ error: "The username which you have provided does not exist."});
  }
  
  //attach a then promise which allows me to invoke the document instance method verify password.
  user.then((user) => {
    user.verifyPassword(password, (error, matched) => {
      if(!matched) {
        return res.status(400).send({message: error});
      }else{
         //Generate JSON Web token for user to be authenticated.      
         admin.auth().createCustomToken(username)
         .then(token => res.send({ 
           success: true, 
           message: "The username and password combination is correct.",
           token: token        
         }))
         .catch((err) => res.status(422).send({ error: err})); //send token back to client.
      }
    });
  })
      
}

function generateHexdecimal(number) {
  return crypto.randomBytes(number).toString('hex');
}

//for processing the request to reset user password.
exports.forgottenPassword = function(req,res, next) {

  const email = req.body.email;

  //generate hash for the request token
  //when it succeeds pass it to the user.
  var token = generateHexdecimal(20);
  
  var user = UserClass.findOne({ email: email}, function(error, user) {
    if(error) { return next(error); }
    //The token and the date time it is valid for.
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000 // valid for 1 hour. 
    
    //save token and its expiring date. 
    user.save(function(err) {
      if(error) { return next(error) };
    });

    let transporter = nodeMail.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: googleAuth.username, // generated ethereal user
        pass: googleAuth.password // generated ethereal password
      }
    });
  
    var mailOptions = {
      to: user.email,
      from: 'no-reply@crimegis.com',
      subject: 'Password Reset',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n\n' +
        'NOTE that the link expires after 1 hour!'
    };
  
    //send the mail
    transporter.sendMail(mailOptions, function(err) {
      if(err) { 
        return req.status(422).send({error: error}); 
      }
      return res.status(200).send({ message: 'An e-mail has been sent to ' + user.email + ' with further instructions.'});
    });

  }).exec();

  if(!user) { return res.status(400).send({ error: "The user provided is not found."})}

 
}

exports.navigateToResetPassword = function(req, res, next) {
  UserClass.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, 
  (err, user) => {
    if(!user) {
      return res.status(422).send({error: 'Password reset token is invalid or has expired.'});
      //return res.redirect('/forgot');
    }
      
    res.render('reset', 
      { //pass the token to the view. 
        token: req.params.token
      });
    
  })

};



   //then request onetime password. POST
  exports.reqPasswordReset = function (req, res) {
    //takes an array of functions and minimalises the number of callbacks.
    async.waterfall([
      function(done) {
      UserClass.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          //req.flash('error', 'Password reset token is invalid or has expired.');
          return res.status(422).send({error: 'The user with the token cannot be found.'});
        }

        if(req.body.password === req.body.confirm) {
               
                  //reset the token and expiring date
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
          
                //save token and its expiring date. 
                user.save(function(err) {
                  if(err) { return done(err) };
                  done(err, user);
                });
        }
      });
    },
    function(user, done) {
      let transporter = nodeMail.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: googleAuth.username, // generated ethereal user
          pass: googleAuth.password // generated ethereal password
        }
      });

      var mailOptions = {
        to: user.email,
        from: 'passwordreset@crimegis.com',
        subject: 'Your password has been changed',
        text: "Hello," + user.username + "\n\n" +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      transporter.sendMail(mailOptions, function(err) {
        //req.flash('success', 'Success! Your password has been changed.');
        console.log("Password has been successfully changed.");
        done(err);
      });
    }
  ],
  function(err) {
    res.redirect('/');
  });

};

// twilio.messages.create({
//   body: 'Your code is ' + code,
//   to: phone,
//   from: '+441383630049'
// }, (err) => {
//   if (err) { return res.status(422).send(err); }

//   admin.database().ref('users/' + phone)
//     .update({ code: code, codeValid: true }, () => {
//       res.send({ success: true });
//     });
// })

