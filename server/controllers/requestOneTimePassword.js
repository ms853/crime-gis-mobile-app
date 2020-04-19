module.exports = function(req, res) {
    if(!req.body.phone) {
        return res.status(422).send({ error: 'You must provide a valid phone number'});
    }
    //look at the phone number and take out any characters that are not digits.
    //and replace those characters with an empty string.
    const phone = String(req.body.phone).replace(/[^\d]/g, '');

    admin.auth().getUser(phone)
    .then(userRecord => {
      const code = Math.floor((Math.random() * 8999 + 1000));

      twilio.messages.create({
        body: 'Your code is ' + code,
        to: phone,
        from: '+441362709405' 
      }, (err) => {
        if (err) { return res.status(422).send(err); }

        admin.database().ref('users/' + phone)
          .update({ code: code, codeValid: true }, () => {
            res.send({ success: true });
          });
      })
    })
    .catch((err) => {
      res.status(422).send({ error: err });
    });
    
};