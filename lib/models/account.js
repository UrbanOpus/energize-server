var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    path = require('path'),
    config = require(path.join(__dirname, '..', '/config/config.js')),
    crypto = require('crypto');
    jwt = require('jwt-simple'),
    tokenSecret = 'put-a-$Ecr3t-h3re';

var Token = new Schema({
    token: {type: String},
    date_created: {type: Date, default: Date.now},
});
Token.methods.hasExpired= function(){
    var now = new Date();
    return (now.getTime() - this.date_created.getTime()) > config.ttl;
};
var TokenModel = mongoose.model('Token', Token);

var Account = new Schema({
    fname: {type: String, required: true},
    lname: {type: String, required: true},
    email: { type: String, required: true, index: { unique: true } },
    password : {type: String, required: true},
    date_created: {type: Date, default: Date.now},
    token: {type: String},
    //For reset we use a reset token with an expiry (which must be checked)
    reset_token: {type: String},
    reset_token_expires_millis: {type: Number}
});


Account.statics.encode = function(data) {
    return jwt.encode(data, tokenSecret);
};
Account.statics.decode = function(data) {
    return jwt.decode(data, tokenSecret);
};
Account.statics.findUser = function(email, token, cb) {
    var self = this;
    this.findOne({email: email}, function(err, usr) {
        if(err || !usr) {
            cb(err, null);
        } else if (token === usr.token.token) {
            cb(false, {email: usr.email, token: usr.token, date_created: usr.date_created, full_name: usr.full_name});
        } else {
            cb(new Error('Token does not match.'), null);
        }
    });
};

Account.statics.findUserByEmailOnly = function(email, cb) {
    var self = this;
    this.findOne({email: email}, function(err, usr) {
        if(err || !usr) {
            cb(err, null);
        } else {
            cb(false, usr);
        }
    });
};

Account.statics.varifyUser = function(email, password, cb) {
    var self = this;
    this.findOne({email:email}, function(err, usr) {
        if(err || !usr) {
            cb(new Error('Invalid user, you must register your email.'), null);
        } else if(password === usr.password) {
            cb(false, usr);
        } else {
//            console.log("Unable to verify user.");
            cb(new Error('Password does not match.'), null);
        }
    })
}

Account.statics.findUserByTokenOnly = function(email, cb) {
    var self = this;
    this.findOne({token: token}, function(err, usr) {
        if(err || !usr) {
            cb(err, null);
        } else {
            cb(false, usr);
        }
    });
};

Account.statics.createUserToken = function(email, cb) {
    var self = this;
    this.findOne({email: email}, function(err, usr) {
        if(err || !usr) {
            console.log('err');
        }
        //Create a token and add to user and save
        // var token = self.encode({email: email});
        // usr.token = new TokenModel({token:token});
        usr.token = self.encode({email: email});
        console.log("User Token : " + usr.token);
        usr.save(function(err, usr) {
            if (err) {
                cb(err, null);
            } else if (!usr.token) {
                cb("Unable to create user token from email " + email, null);
            } else {
                console.log("about to cb with usr.token.token: " + usr.token);
                cb(false, usr);//token object, in turn, has a token property :)
            }
        });
    });
};

Account.statics.generateResetToken = function(email, cb) {
    console.log("in generateResetToken....");
    this.findUserByEmailOnly(email, function(err, user) {
        if (err) {
            cb(err, null);
        } else if (user) {
            //Generate reset token and URL link; also, create expiry for reset token
            user.reset_token = require('crypto').randomBytes(32).toString('hex');
            var now = new Date();
            var expires = new Date(now.getTime() + (config.resetTokenExpiresMinutes * 60 * 1000)).getTime();
            user.reset_token_expires_millis = expires;
            user.save();
            cb(false, user);
        } else {
            //TODO: This is not really robust and we should probably return an error code or something here
            cb(new Error('No user with that email found.'), null);
        }
    });
};
//Account.plugin()
module.exports = mongoose.model('Account', Account);