/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  // Check provided email address and password
  login: function (req, res) {

    if (!req.param( 'name' ) || !req.param( 'password' )) {
      return res.json(401, {err: 'username and password required'});
    }   

    // try to look up user using the provided username/email address
    User.findOne({
      or: [{
          username: req.param( 'name' )
        },{
          email: req.param( 'name' )
        }]
    }, function foundUser( err, user ) {
      if (err) return res.negotiate( err );
      if (!user) return res.notFound();

      // compare params passpwrd to the encrypted db password
      require( 'machinepack-passwords' ).checkPassword({
        passwordAttempt: req.param( 'password' ),
        encryptedPassword: user.password
      }).exec({

        error: function ( err ){
          return res.negotiate( err );
        },

        // If the password from the form params doesn't checkout w/ the encrypted
        // password from the database...
        incorrect: function (){
          return res.notFound();
        },

        success: function (){

          // Send back user with token
          return res.ok({
            id: user.id,
            token: jwtToken.issueToken({sid: user.id}),
            organisation: user.organisation,
            username: user.username,
            email: user.email,
            roles: user.roles
          });
        }
      });
    });

  }

};