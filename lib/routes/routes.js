'use strict';

var path = require('path');
var config = require(path.join(__dirname, '..', '/config/config.js'));
var Account = require(path.join(__dirname, '..', '/models/account'));

/**
* @module Routes
*/

module.exports = function (app, passport) {

    /**
    * Default route for app, currently displays signup form.
    *
    * @param {Object} req the request object
    * @param {Object} res the response object
    */

    app.get('/', function (req, res) {
        res.send("Why Hello!");
    });

    /*app.get('/login',
        passport.authenticate(),
        function(req, res) {
    });

    app.get('/profile', 
        passport.authenticate('bearer', { session: false }),
        function(req, res) {
            res.json(req.user);
    });*/

    /*app.post('/access_token', 
        passport.authenticate('bearer', { session: false }),
        //oauthorize.accessToken(
        // ...
    });*/

    app.get('/testjson', function (req, res) {
        res.send
    });

    /**
    * Post method for user login
    *
    * @param {Object} req the request object containing email and password
    * @param {Object} res the response object containing user and token
    */
    app.post('/api/login', function(req, res) {
        console.log(req.body);
        var email = req.body.email;
        var password = req.body.password;
        Account.varifyUser(email, password, function(err, user) {
            if(!err && user) {
                res.json({
                    "user":user
                });
            } else {
                res.json({
                    "error":err.message
                });
            }
        })
    });


    /**
    * Post method to register a new user
    *
    * @param {Object} req the request object
    * @param {Object} res the response object
    */

    app.post('/api/register', function(req, res) {
        console.log(req.body);
        var fname = req.body.fname;
        var lname = req.body.lname;        
        var email = req.body.email;
        var password = req.body.password;
        console.log("User Email: " + email);
        console.log("User Name: " + fname + " " + lname);
        console.log("Password: " + password);

        var new_user = new Account(
            {   "fname": fname,
                "lname": lname,
                "email": email,
                "password": password
            });
        new_user.save(function (err, user) {
            if(!err) {
                console.log("User Created! " + user.email);
                Account.createUserToken(user.email, function(error, usr) {
                    if(!error) {
                        console.log("User Token created");
                        console.log("Email : " + usr.email);
                        console.log("Token : " + usr.token);
                        res.json(
                            {
                                "user":usr
                            });
                    } else {
                        var err_text = "Error creating user token : " + error
                        console.error(err_text);
                        res.json({"error":err_text});
                    }
                });
            } else {
                console.log("ERROR! ");
                console.log(err);
                res.json({"error": err});
            }
        });
        
    });


    /**
    * Login method
    *
    * @param {Object} req the request object
    * @param {Object} res the response object
    */

    /*app.get('/login', function(req, res) {
        var messages = flash(null, null);

        if (req.param('registered') === '1') {
            messages = 'Congratulations, your account was created!';
        }

        res.render('login', messages);
    });

    app.post('/token/', passport.authenticate('local', {session: false}), function(req, res) {
        if (req.user) {
            Account.createUserToken(req.user.email, function(err, usersToken) {
                // console.log('token generated: ' +usersToken);
                // console.log(err);
                if (err) {
                    res.json({error: 'Issue generating token'});
                } else {
                    res.json({token : usersToken});
                }
            });
        } else {
            res.json({error: 'AuthError'});
        }
    });

    app.get('/apitest/', function(req, res) {
        var incomingToken = req.headers.token;
        console.log('incomingToken: ' + incomingToken);
        var decoded = Account.decode(incomingToken);
        //Now do a lookup on that email in mongodb ... if exists it's a real user
        if (decoded && decoded.email) {
            Account.findUser(decoded.email, incomingToken, function(err, user) {
                if (err) {
                    console.log(err);
                    res.json({error: 'Issue finding user.'});
                } else {
                    res.json({
                        user: {
                            email: user.email,
                            full_name: user.full_name,
                            token: user.token.token
                        }
                    });
                }
            });
        } else {
            console.log('Whoa! Couldn\'t even decode incoming token!');
            res.json({error: 'Issue decoding incoming token.'});
        }
    });
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/forgot', function(req, res) {
        res.render('forgot');
    });

    app.post('/forgot', function(req, res) {

        Account.generateResetToken(req.body.email, function(err, user) {
            if (err) {
                res.json({error: 'Issue finding user.'});
            } else {
                var token = user.reset_token;
                var resetLink = 'http://localhost:1337/reset/'+ token;

                //TODO: This is all temporary hackish. When we have email configured
                //properly, all this will be stuffed within that email instead :)
                res.send('<h2>Reset Email (simulation)</h2><br><p>To reset your password click the URL below.</p><br>' +
                '<a href=' + resetLink + '>' + resetLink + '</a><br>' +
                'If you did not request your password to be reset please ignore this email and your password will stay as it is.');
            }
        });
    });

    app.get('/reset/:id', function(req, res) {
        console.log('GOT IN /reset/:id...');
        var token = req.params.id,
            messages = '';

        if (!token) {
            console.log('Issue getting reset :id');
            //TODO: Error response...
        }
        else {
            console.log('In ELSE ... good to go.');
            //TODO
            //
            //1. find user with reset_token == token .. no match THEN error
            //2. check now.getTime() < reset_link_expires_millis
            //3. if not expired, present reset password page/form
            res.render('resetpass', messages);
        }
    });*/
};