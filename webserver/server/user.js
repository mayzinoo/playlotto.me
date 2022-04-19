var ct = require('countries-and-timezones');
var geoip = require('geoip-lite');
var assert = require('better-assert');
var express = require('express');
var app = express();
var async = require('async');
var web3 = require('web3');
var request = require('request');
var timeago = require('timeago');
var lib = require('./lib');
var database = require('./database');
var withdraw = require('./withdraw');
var tip = require('./tip');
var depositrequesteth = require('./depositrequesteth');
var withdrawrequest = require('./withdrawrequest');
var sendEmail = require('./sendEmail');
var speakeasy = require('speakeasy');
var qr = require('qr-image');
var uuid = require('uuid');
var _ = require('lodash');
var config = require('../config/config');
/*var withdrawrequest = require('./withdrawrequest');*/
/*const session = require("express-session");*/
const crypto = require('crypto');
var sessionOptions = {
    httpOnly: true,
    secure : config.PRODUCTION
};

/**
 * POST
 * Public API
 * Register a user
 */
exports.register  = function(req, res, next) {
    var values = _.merge(req.body, { user: {} });
    var recaptcha = lib.removeNullsAndTrim(req.body['g-recaptcha-response']);
    var username = lib.removeNullsAndTrim(req.body.username);
    var password = lib.removeNullsAndTrim(req.body.password);
    var password2 = lib.removeNullsAndTrim(req.body.confirm);
    var email = lib.removeNullsAndTrim(req.body.email);
    var ipAddress = req.ip;
    var userAgent = req.get('user-agent');
    var referral = null;
    
    if(req.body.referral_code){
        referral = req.body.referral_code;
    }
    var notValid = lib.isInvalidUsername(username);
    if (notValid) res.redirect('/#namewarning'); 

    // stop new registrations of >16 char usernames
    if (username.length > 16)
        return res.redirect('/#namelengthwarning');

    notValid = lib.isInvalidPassword(password);
    if (notValid) {
        values.user.password = null;
        values.user.confirm = null;
        return res.redirect('/#passwordwarning');
    }

    // if (email) {
    //     notValid = lib.isInvalidEmail(email);
    //     if (notValid) return res.render('register', { warning: 'email not valid because: ' + notValid, values: values.user });
    // }

    // Ensure password and confirmation match
    if (password !== password2) {
        return res.redirect('/#donotmatchwarning');
    }

   var ip = req.ip;    
    var geo = geoip.lookup(ip);
    var country = geo['country'];
    var data = ct.getCountry(country);
    var user_timezone = data.timezones[0]; 

    database.createUser(username, password, email, ipAddress, userAgent, user_timezone, function(err, sessionId,userId) {
        if (err) {
            if (err === 'USERNAME_TAKEN') {
                values.user.name = null;
                return res.redirect('/#alreadytakenwarning');
            }
            return next(new Error('Unable to register user: \n' + err));
        }

    var ip = req.ip;
        //var ip = "103.42.216.193";
        var geo = geoip.lookup(ip);
        var country = geo['country'];
        console.log('country', country);
        var data = ct.getCountry(country);
        var user_timezone = data.timezones[0];
        console.log(user_timezone);

        
        
   
         res.cookie('id', sessionId, sessionOptions);
            return res.redirect('/');
        
    });
};
/**
 * POST
 * Public API
 * Login a user
 */
exports.login = function(req, res, next) {

    var username = lib.removeNullsAndTrim(req.body.username);
    var password = lib.removeNullsAndTrim(req.body.password);
    var otp = lib.removeNullsAndTrim(req.body.otp); // OTP: One-time password
    var remember = !!req.body.remember;
    var ipAddress = req.ip;
    var userAgent = req.get('user-agent');

console.log("nameeeee".username);
    if (!username || !password)        
        res.redirect('/#nouser');

    database.validateUser(username, password, otp, function(err, userId, userbalance) {
        if (err) {
            console.log('[Login] Error for ', username, ' err: ', err);
            if (err === 'NO_USER')
                return res.redirect('/#nouserorpass');
            if (err === 'USER_IS_BLOCKED')
                return res.redirect('/#userisblocked');
            if (err === 'WRONG_PASSWORD')
                return res.redirect('/#wrongpassword');
            if (err === 'INVALID_OTP') {
                var warning = otp ? 'Invalid one-time password' : undefined;
                return res.redirect('/#login-mfa', { username: username, password: password, warning: warning });
            }
            return next(new Error('Unable to validate user ' + username + ': \n' + err));
        }
        assert(userId);

       //var ip = req.ip;
        var ip = "103.42.216.193";
        var geo = geoip.lookup(ip);
        var country = geo['country'];
        console.log('country', country);
        var data = ct.getCountry(country);
        var user_timezone = data.timezones[0];
        console.log(user_timezone);
        
        database.updateTimezone(userId, user_timezone, function(err) {
            if (err)
                return next(new Error('Unable to update timezone: \n' + err));
        });

        database.createSession(userId, ipAddress, userAgent, remember, function(err, sessionId, expires) {
            if (err)
                return next(new Error('Unable to create session for userid ' + userId +  ':\n' + err));

            if(remember)
                sessionOptions.expires = expires;

            res.cookie('id', sessionId, sessionOptions);
            res.redirect('/play');
        });
    });
};

/**
 * POST
 * Logged API
 * Logout the current user
 */
exports.logout = function(req, res, next) {
    var sessionId = req.cookies.id;
    var userId = req.user.id;

    assert(sessionId && userId);
    console.log('logout')

    database.expireSessionsByUserId(userId, function(err) {
        if (err)
            return next(new Error('Unable to logout got error: \n' + err));
        res.redirect('/');
    });
};

exports.handleDepositRequest = function(req, res, next) {
    var user = req.user;
    var status = '0';
    assert(user);
    var deposit_address = req.body.eth_address;

    console.log('ETHEREUM DEPOSIT ADD', req.body.eth_address);

    if(req.body.ethereum_amt ==''){
        res.redirect('/account/#depnull-error');
    }
    else{
        var currency_type = 'ITEN';  
    
        var currency_amt = Math.round(req.body.ethereum_amt);
        var wow_amt = Math.round(req.body.ethereum_amt);
        var deposit_name = '';

        var deposit_address = req.body.eth_address;        
        depositrequesteth(user.id, deposit_address, currency_type, currency_amt, wow_amt, deposit_name, status, function(err) {
                if (err) {                   
                    return next(new Error('Unable to request deposit: ' + err));
                }
                else{ 
                        res.redirect('/account/#eth-success');                                     
                    }
            });  
   }   
    
    console.log('Currency Amt', currency_amt);
        
};

exports.handlenewWithdrawRequest = function(req, res, next) {
    var user = req.user;
    var status = '0';
    assert(user);

    var currency_type = 'ETH';  
    var withdrawal_id = req.body.withdrawal_id; 
    var miningFee = config.MINING_FEE; 
    
    var amount = req.body.eth_amount;     
        var etherum_address = req.body.eth_etherum_address; 
        var currency_amount = Number(req.body.eth_change_value) + Number(miningFee);
        var country = '';
        var bank_name = '';
        var owner_name = '';
        var account_address = '';

        
    
    database.getUserBalance(user.id, function(err, balance) {
        if (err) {
            console.log(err);
            return next(new Error('Unable to get withdraw information: \n' + err));
        }        
        else{
            var balance = balance;
            if(balance < amount )
            {
                 res.redirect('/account/#amount-notenough');  
            } 
            else{
                // console.log('ww',currency_type);
                // console.log('ww',amount);
                // console.log('ww',currency_amount);
                // console.log('ww',country);
                // console.log('ww',bank_name);
                // console.log('ww',owner_name);
                // console.log('ww',account_address);
                // console.log('ww',etherum_address);
                // console.log('ww',status);
                // console.log('ww', withdrawal_id);
                
                withdrawrequest(user.id, currency_type, amount, currency_amount, country, bank_name, owner_name, account_address, etherum_address, status, withdrawal_id, function(err) {
                if (err) {                   
                    return next(new Error('Unable to request deposit: ' + err));
                }
                else{
                        //Decrease Amount
                        database.decreaseamount(user.id, amount,  function(err) {
                            //console.log('Error withdraw',err);
                         });                         

                        res.redirect('/account/#successwithdraw');        
                    }
            }); 
          }
        }   
    });           
};


/**
 * GET
 * Logged API
 * Shows the graph of the user profit and games
 */
exports.profile = function(req, res, next) {

    var user = req.user; //If logged here is the user info
    var username = lib.removeNullsAndTrim(req.params.name);

    var page = null;
    if (req.query.p) { //The page requested or last
        page = parseInt(req.query.p);
        if (!Number.isFinite(page) || page < 0)
            return next('Invalid page');
    }

    if (!username)
        return next('No username in profile');

    database.getPublicStats(username, function(err, stats) {
        if (err) {
            if (err === 'USER_DOES_NOT_EXIST')
               return next('User does not exist');
            else
                return next(new Error('Cant get public stats: \n' + err));
        }

        /**
         * Pagination
         * If the page number is undefined it shows the last page
         * If the page number is given it shows that page
         * It starts counting from zero
         */

        var resultsPerPage = 50;
        var pages = Math.floor(stats.games_played / resultsPerPage);

        if (page && page >= pages)
            return next('User does not have page ', page);

        // first page absorbs all overflow
        var firstPageResultCount = stats.games_played - ((pages-1) * resultsPerPage);

        var showing = page ? resultsPerPage : firstPageResultCount;
        var offset = page ? (firstPageResultCount + ((pages - page - 1) * resultsPerPage)) : 0 ;

        if (offset > 100000) {
          return next('Sorry we can\'t show games that far back :( ');
        }

        var tasks = [
            function(callback) {
                database.getUserNetProfitLast(stats.user_id, showing + offset, callback);
            },
            function(callback) {
                database.getUserPlays(stats.user_id, showing, offset, callback);
            }
        ];


        async.parallel(tasks, function(err, results) {
            if (err) return next(new Error('Error getting user profit: \n' + err));

            var lastProfit = results[0];

            var netProfitOffset = stats.net_profit - lastProfit;
            var plays = results[1];


            if (!lib.isInt(netProfitOffset))
                return next(new Error('Internal profit calc error: ' + username + ' does not have an integer net profit offset'));

            assert(plays);

            plays.forEach(function(play) {
                play.timeago = timeago(play.created);
            });

            var previousPage;
            if (pages > 1) {
                if (page && page >= 2)
                    previousPage = '?p=' + (page - 1);
                else if (!page)
                    previousPage = '?p=' + (pages - 1);
            }

            var nextPage;
            if (pages > 1) {
                if (page && page < (pages-1))
                    nextPage ='?p=' + (page + 1);
                else if (page && page == pages-1)
                    nextPage = stats.username;
            }

            res.render('user', {
                user: user,
                stats: stats,
                plays: plays,
                net_profit_offset: netProfitOffset,
                showing_last: !!page,
                previous_page: previousPage,
                next_page: nextPage,
                games_from: stats.games_played-(offset + showing - 1),
                games_to: stats.games_played-offset,
                pages: {
                    current: page == 0 ? 1 : page + 1 ,
                    total: Math.ceil(stats.games_played / 100)
                }
            });
        });

    });
};

/**
 * GET
 * Shows the request bits page
 * Restricted API to logged users
 **/
exports.request = function(req, res) {
    var user = req.user; //Login var
    assert(user);

    res.render('request', { user: user });
};

/**
 * POST
 * Process the give away requests
 * Restricted API to logged users
 **/
exports.giveawayRequest = function(req, res, next) {
    var user = req.user;
    assert(user);

    database.addGiveaway(user.id, function(err) {
        if (err) {
            if (err.message === 'NOT_ELIGIBLE') {
                return res.render('request', { user: user, warning: 'You have to wait ' + err.time + ' minutes for your next give away.' });
            } else if(err === 'USER_DOES_NOT_EXIST') {
                return res.render('error', { error: 'User does not exist.' });
            }

            return next(new Error('Unable to add giveaway: \n' + err));
        }
        user.eligible = 240;
        user.balance += 200;
        return res.redirect('/play?m=received');
    });

};

/**
 * GET
 * Restricted API
 * Shows the account page, the default account page.
 **/
exports.account = function(req, res, next) {
    var user = req.user;
    var tamount;
    assert(user);

    var tasks = [
        function(callback) {
            database.getDepositsAmount(user.id, callback);
        },
        function(callback) {
            database.getWithdrawalsAmount(user.id, callback);
        }
    ];

    async.parallel(tasks, function(err, ret) {
        if (err)
            return next(new Error('Unable to get account info: \n' + err));

        var deposits =  ret[0];
        var withdrawals = ret[1];        
        //var giveaways = await ret[2];
        //var net = await ret[3];
        let depositsSum = 0;
        let withdrawlsSum = 0;

        //console.log(deposits);
        deposits.map((v) => {
            depositsSum = depositsSum + v.amount;
        })
        withdrawals.map((v) => {
            withdrawlsSum = withdrawlsSum + v.amount*-1;
        })
        user.deposits = deposits;
        user.depositsSum = depositsSum;
        user.withdrawlsSum = withdrawlsSum;

        
        //user.withdrawals = !withdrawals.sum ? 0 : withdrawals.sum;
        user.withdrawals = withdrawals;
        //user.giveaways = !giveaways.sum ? 0 : giveaways.sum;
        //user.net_profit = net.profit;
        
        //Get Ethereum Deposit Address
        database.getethaddress(function(err, id, address) {             
            user.deposit_address = address;
            var eth_id = id; 
            var istaken = 1;
        
            database.deleteethaddress(eth_id,istaken, function(err) {                         
            });                     
            
        });

        //End Ethereum Deposit Address      
        
     
            
        /* Start get bankinfo */          
        database.getBankinfousd(function(err, bankinfousd) {             
            user.bankinfousd = bankinfousd;                   
            
        });
        database.getBankinfokrw(function(err, bankinfokrw) {        
            user.bankinfokrw = bankinfokrw;         
            
        });  
        database.getBankinfovnd(function(err, bankinfovnd) {        
            user.bankinfovnd = bankinfovnd;           
            
        });
        database.getTips(user.id, function(err, tips) {
        
            user.tips = tips;
            res.render('account', { user: user, id: uuid.v4() });            
        }); 
        
            
        //res.render('account', { user: user, id: uuid.v4() });
    });
};
     

/**
 * GET
 * Restricted API
 * Shows the wallet page, the default wallet page.
 **/
exports.wallet = function(req, res, next) {
    var user = req.user;
    assert(user);

    var tasks = [
        function(callback) {
            database.getDepositsAmount(user.id, callback);
        },
        function(callback) {
            database.getWithdrawalsAmount(user.id, callback);
        },
        function(callback) {
            database.getGiveAwaysAmount(user.id, callback);
        },
        function(callback) {
            database.getUserNetProfit(user.id, callback)
        }
    ];

    async.parallel(tasks, function(err, ret) {
        if (err)
            return next(new Error('Unable to get account info: \n' + err));

        var deposits = ret[0];
        var withdrawals = ret[1];
        //var giveaways = ret[2];
        //var net = ret[3];
        user.deposits = !deposits.sum ? 0 : deposits.sum;
        user.withdrawals = !withdrawals.sum ? 0 : withdrawals.sum;
        //user.giveaways = !giveaways.sum ? 0 : giveaways.sum;
        //user.net_profit = net.profit;
        user.deposit_address = lib.deriveAddress(user.id);

        res.render('wallet', { user: user });
    });
};

/**
 * POST
 * Restricted API
 * Change the user's password
 **/
exports.resetPassword = function(req, res, next) {
    var user = req.user;
    assert(user);
    if(req.body.old_password =='' || req.body.password =='' || req.body.confirmation==''){
        return  res.redirect('/account/#input-warning');
    }
    else{
    var password = lib.removeNullsAndTrim(req.body.old_password);
    var newPassword = lib.removeNullsAndTrim(req.body.password);
    var otp = lib.removeNullsAndTrim(req.body.otp);
    var confirm = lib.removeNullsAndTrim(req.body.confirmation);
    var ipAddress = req.ip;
    var userAgent = req.get('user-agent');

    if (!password) return  res.redirect('/account/#old-pass-error');

    var notValid = lib.isInvalidPassword(newPassword);
console.log('Hiiiiiiiiiiiiii',newPassword);
    if (notValid) return res.redirect('/account/#new-pass-error');

    if (newPassword !== confirm) return  res.redirect('/account/#same-error');

    database.validateUser(user.username, password, otp, function(err, userId) {
        if (err) {
            if (err  === 'WRONG_PASSWORD') return  res.redirect('/account/#wrong-password');
            // if (err === 'INVALID_OTP') return res.redirect('/security?err=invalid one-time password.');
            //Should be an user here
            //return next(new Error('Unable to reset password: \n' + err));
        }
        assert(userId === user.id);
        database.changeUserPassword(user.id, newPassword, function(err) {
            if (err)
                return res.redirect('/account/#change-error');

            database.expireSessionsByUserId(user.id, function(err) {
                if (err)
                    return res.redirect('/account/#change-error');

                database.createSession(user.id, ipAddress, userAgent, false, function(err, sessionId) {
                    if (err)
                        return res.redirect('/account/#change-error');

                    res.cookie('id', sessionId, sessionOptions);
            console.log('CCCCCCCCCCCCc');   
                    return res.redirect('/account/#change-success');
                });
            });
        });
    });
  }
};
    
/**
 * POST
 * Restricted API
 * Adds an email to the account
 **/
exports.editEmail = function(req, res, next) {
    var user  = req.user;
    assert(user);

    var email = lib.removeNullsAndTrim(req.body.email);
    var password = lib.removeNullsAndTrim(req.body.password);
    var otp = lib.removeNullsAndTrim(req.body.otp);

    //If no email set to null
    if(email.length === 0) {
        email = null;
    } else {
        var notValid = lib.isInvalidEmail(email);
        if (notValid) return res.redirect('/security?err=email invalid because: ' + notValid);
    }

    notValid = lib.isInvalidPassword(password);
    if (notValid) return res.render('/security?err=password not valid because: ' + notValid);

    database.validateUser(user.username, password, otp, function(err, userId) {
        if (err) {
            if (err === 'WRONG_PASSWORD') return res.redirect('/security?err=wrong%20password');
            if (err === 'INVALID_OTP') return res.redirect('/security?err=invalid%20one-time%20password');
            //Should be an user here
            return next(new Error('Unable to validate user adding email: \n' + err));
        }

        database.updateEmail(userId, email, function(err) {
            if (err)
                return next(new Error('Unable to update email: \n' + err));

            res.redirect('security?m=Email added');
        });
    });
};

/**
 * GET
 * Restricted API
 * Shows the security page of the users account
 **/
exports.security = function(req, res) {
    var user = req.user;
    assert(user);

    if (!user.mfa_secret) {
        user.mfa_potential_secret = speakeasy.generate_key({ length: 32 }).base32;
        var qrUri = 'otpauth://totp/bustabit:' + user.username + '?secret=' + user.mfa_potential_secret + '&issuer=bustabit';
        user.qr_svg = qr.imageSync(qrUri, { type: 'svg' });
        user.sig = lib.sign(user.username + '|' + user.mfa_potential_secret);
    }

    res.render('security', { user: user });
};

/**
 * POST
 * Restricted API
 * Enables the two factor authentication
 **/
exports.enableMfa = function(req, res, next) {
    var user = req.user;
    assert(user);

    var otp = lib.removeNullsAndTrim(req.body.otp);
    var sig = lib.removeNullsAndTrim(req.body.sig);
    var secret = lib.removeNullsAndTrim(req.body.mfa_potential_secret);

    if (user.mfa_secret) return res.redirect('/security?err=2FA%20is%20already%20enabled');
    if (!otp) return next('Missing otp in enabling mfa');
    if (!sig) return next('Missing sig in enabling mfa');
    if (!secret) return next('Missing secret in enabling mfa');

    if (!lib.validateSignature(user.username + '|' + secret, sig))
        return next('Could not validate sig');

    var expected = speakeasy.totp({ key: secret, encoding: 'base32' });

    if (otp !== expected) {
        user.mfa_potential_secret = secret;
        var qrUri = 'otpauth://totp/bustabit:' + user.username + '?secret=' + secret + '&issuer=bustabit';
        user.qr_svg = qr.imageSync(qrUri, {type: 'svg'});
        user.sig = sig;

        return res.render('security', { user: user, warning: 'Invalid 2FA token' });
    }

    database.updateMfa(user.id, secret, function(err) {
        if (err) return next(new Error('Unable to update 2FA status: \n' + err));
        res.redirect('/security?=m=Two-Factor%20Authentication%20Enabled');
    });
};

/**
 * POST
 * Restricted API
 * Disables the two factor authentication
 **/
exports.disableMfa = function(req, res, next) {
    var user = req.user;
    assert(user);

    var secret = lib.removeNullsAndTrim(user.mfa_secret);
    var otp = lib.removeNullsAndTrim(req.body.otp);

    if (!secret) return res.redirect('/security?err=Did%20not%20sent%20mfa%20secret');
    if (!user.mfa_secret) return res.redirect('/security?err=2FA%20is%20not%20enabled');
    if (!otp) return res.redirect('/security?err=No%20OTP');

    var expected = speakeasy.totp({ key: secret, encoding: 'base32' });

    if (otp !== expected)
        return res.redirect('/security?err=invalid%20one-time%20password');

    database.updateMfa(user.id, null, function(err) {
        if (err) return next(new Error('Error updating Mfa: \n' + err));

        res.redirect('/security?=m=Two-Factor%20Authentication%20Disabled');
    });
};

/**
 * POST
 * Public API
 * Send password recovery to an user if possible
 **/
exports.sendPasswordRecover = function(req, res, next) {
    var email = lib.removeNullsAndTrim(req.body.email);
    if (!email) return res.redirect('forgot-password');
    var remoteIpAddress = req.ip;

    //We don't want to leak if the email has users, so we send this message even if there are no users from that email
    var messageSent = { success: 'We\'ve sent an email to you if there is a recovery email.' };

    database.getUsersFromEmail(email, function(err, users) {
        if(err) {
            if(err === 'NO_USERS')
                return res.render('forgot-password', messageSent);
            else
                return next(new Error('Unable to get users by email ' + email +  ': \n' + err));
        }

        var recoveryList = []; //An array of pairs [username, recoveryId]
        async.each(users, function(user, callback) {

            database.addRecoverId(user.id, remoteIpAddress, function(err, recoveryId) {
                if(err)
                    return callback(err);

                recoveryList.push([user.username, recoveryId]);
                callback(); //async success
            })

        }, function(err) {
            if(err)
                return next(new Error('Unable to add recovery id :\n' + err));

            sendEmail.passwordReset(email, recoveryList, function(err) {
                if(err)
                    return next(new Error('Unable to send password email: \n' + err));

                return res.render('forgot-password',  messageSent);
            });
        });

    });
};

/**
 * GET
 * Public API
 * Validate if the reset id is valid or is has not being uses, does not alters the recovery state
 * Renders the chang
/**/
exports.validateResetPassword = function(req, res, next) {
    var recoverId = req.params.recoverId;
    if (!recoverId || !lib.isUUIDv4(recoverId))
        return next('Invalid recovery id');

    database.getUserByValidRecoverId(recoverId, function(err, user) {
        if (err) {
            if (err === 'NOT_VALID_RECOVER_ID')
                return next('Invalid recovery id');
            return next(new Error('Unable to get user by recover id ' + recoverId + '\n' + err));
        }
        res.render('reset-password', { user: user, recoverId: recoverId });
    });
};
 /* POST
 * Public API
 * Receives the new password for the recovery and change it
 **/
exports.resetPasswordRecovery = function(req, res, next) {
    var recoverId = req.body.recover_id;
    var password = lib.removeNullsAndTrim(req.body.password);
    var ipAddress = req.ip;
    var userAgent = req.get('user-agent');

    if (!recoverId || !lib.isUUIDv4(recoverId)) return next('Invalid recovery id');

    var notValid = lib.isInvalidPassword(password);
    if (notValid) return res.render('reset-password', { recoverId: recoverId, warning: 'password not valid because: ' + notValid });

    database.changePasswordFromRecoverId(recoverId, password, function(err, user) {
        if (err) {
            if (err === 'NOT_VALID_RECOVER_ID')
                return next('Invalid recovery id');
            return next(new Error('Unable to change password for recoverId ' + recoverId + ', password: ' + password + '\n' + err));
        }
        database.createSession(user.id, ipAddress, userAgent, false, function(err, sessionId) {
            if (err)
                return next(new Error('Unable to create session for password from recover id: \n' + err));

            res.cookie('id', sessionId, sessionOptions);
            res.redirect('/');
        });
    });
};

/**
 * GET
 * Restricted API
 * Shows the deposit history
 **/
exports.deposit = function(req, res, next) {
    var user = req.user;
    assert(user);

    database.getDeposits(user.id, function(err, deposits) {
        if (err) {
            return next(new Error('Unable to get deposits: \n' + err));
        }
        user.deposits = deposits;
        user.deposit_address = lib.deriveAddress(user.id);
        res.render('deposit', { user:  user });
    });
};

/**
 * GET
 * Restricted API
 * Shows the withdrawal history
 **/
exports.withdraw = function(req, res, next) {
    var user = req.user;
    assert(user);

    database.getWithdrawals(user.id, function(err, withdrawals) {
        if (err)
            return next(new Error('Unable to get withdrawals: \n' + err));

        withdrawals.forEach(function(withdrawal) {
            withdrawal.shortDestination = withdrawal.destination.substring(0,8);
        });
        user.withdrawals = withdrawals;

        res.render('withdraw', { user: user });
    });
};

/**
 * POST
 * Restricted API
 * Process a withdrawal
 **/
exports.handleWithdrawRequest = function(req, res, next) {
    var user = req.user;
    assert(user);

    var amount = req.body.amount;
    var destination = req.body.destination;
    var withdrawalId = req.body.withdrawal_id;
    var password = lib.removeNullsAndTrim(req.body.password);
    var otp = lib.removeNullsAndTrim(req.body.otp);

    console.log()

    var r =  /^[1-9]\d*(\.\d{0,2})?$/;
    if (!r.test(amount))
        return res.render('withdraw-request', { user: user, id: uuid.v4(),  warning: 'Not a valid amount' });

    amount = Math.floor(parseFloat(amount));
    assert(Number.isFinite(amount));

    var minWithdraw = config.MIN_WITHDRAW;

    if (amount < minWithdraw)
        return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'You must withdraw ' + minWithdraw + ' or more'  });

    if (typeof destination !== 'string')
        return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'Destination address not provided' });


    var isValidAddress = web3.utils.isAddress(destination);

    if(!isValidAddress) {
        return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'Destination address is not a Ethereum one' });
    }
        
    if (!password)
        return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'Must enter a password' });

    if(!lib.isUUIDv4(withdrawalId))
      return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'Could not find a one-time token' });

    database.validateUser(user.username, password, otp, function(err) {

        if (err) {
            if (err === 'WRONG_PASSWORD')
                return res.render('withdraw-request', { user: user, id: uuid.v4(), warning: 'wrong password, try it again...' });
            if (err === 'INVALID_OTP')
                return res.render('withdraw-request', { user: user, id: uuid.v4(), warning: 'invalid one-time token' });
            //Should be an user
            return next(new Error('Unable to validate user handling withdrawal: \n' + err));
        }

        withdraw(req.user.id, amount, destination, withdrawalId, function(err) {
            if (err) {
                if (err === 'NOT_ENOUGH_MONEY')
                    return res.render('withdraw-request', { user: user, id: uuid.v4(), warning: 'Not enough money to process withdraw.' });
                else if (err === 'PENDING')
                    return res.render('withdraw-request', { user: user,  id: uuid.v4(), success: 'Withdrawal successful, however hot wallet was empty. Withdrawal will be reviewed and sent ASAP' });
                else if(err === 'SAME_WITHDRAWAL_ID')
                    return res.render('withdraw-request', { user: user,  id: uuid.v4(), warning: 'Please reload your page, it looks like you tried to make the same transaction twice.' });
                else if(err === 'FUNDING_QUEUED')
                    return res.render('withdraw-request', { user: user,  id: uuid.v4(), success: 'Your transaction is being processed come back later to see the status.' });
                else
                    return next(new Error('Unable to withdraw: ' + err));
            }
            return res.render('withdraw-request', { user: user, id: uuid.v4(), success: 'OK' });
        });
    });
};

/**
 * GET
 * Restricted API
 * Shows the withdrawal request page
 **/
exports.withdrawRequest = function(req, res) {
    assert(req.user);
    res.render('withdraw-request', { user: req.user,  id: uuid.v4() });
};

/**
 * GET
 * Restricted API
 * Shows the send tip page
 **/
exports.tipSend = function(req, res) {
    assert(req.user);
    res.render('tip-send', { user: req.user, id: uuid.v4() });
};

/**
 * GET
 * Restricted API
 * Shows the tip history
 **/
exports.tip = function(req, res, next) {
    var user = req.user;
    assert(user);

    database.getTips(user.id, function(err, tips) {
        if (err)
            return next(new Error('Unable to get tips: \n' + err));
        // var date, created;
        // tips.forEach(function(index, tip) {
        //     date = new Date(tip.created);
        //     created = `${date.getMonth()}/${date.getDay()}/${date.getFullYear()}`; 
        //     console.log(created);
        //     tip.created = created;
        // })
        user.tips = tips;

        res.render('tip', { user: user });
    });
};

/**
 * POST
 * Restricted API
 * Process a tip
 **/
exports.handleTipSend = function(req, res, next) {
    var user = req.user;
    assert(user);

    if(req.body.your_amount =='' || req.body.recipient=='' || req.body.your_password =='') {
        return res.redirect('/account/#input-warning');
    }   
    else{   
    var amount = req.body.your_amount;
    var recipientUsername = req.body.recipient;
    console.log('sssssssssssssssssssss', recipientUsername);
    var tipTxId = uuid.v4();
    var password = lib.removeNullsAndTrim(req.body.your_password);
    var otp = lib.removeNullsAndTrim(req.body.otp);
    var minTip = config.MIN_TIP;

    var r =  /^[1-9]\d*(\.\d{0,2})?$/;
    if (!r.test(amount))
        return res.render('warning-tip-send', { user: user, id: uuid.v4(),  warning: 'Not a valid amount' });

    // amount = Math.round(parseFloat(amount) * 100);
    //  assert(Number.isFinite(amount));

    if (amount < config.MIN_TIP)
        return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'You must send ' + minTip + ' or more'  });

    if (typeof recipientUsername !== 'string')
        return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'Destination User ID not provided' });    

    if (!password)
        //return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'Must enter a password' });
        return  res.redirect('/account/#nopassword');

    // if(!lib.isUUIDv4(tipTxId))
    //     return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'Could not find a one-time token' });
    //console.log('uuid:',uuid.v4());
    // return res.render('warning-tip-send', { user: user, id: uuid.v4(), success: 'OK' });

    database.getUserBalance(user.id, function(err, balance) {
    if (err) {
        console.log(err);
        return next(new Error('Unable to get withdraw information: \n' + err));
    }
    
    else{
        var balance = balance;
        if(balance < amount )
        {
             res.redirect('/account/#amount-notenough');  
        }   
        else{
            database.validateUser(user.username, password, otp, function(err) {

        if (err) {
            if (err === 'WRONG_PASSWORD')
                //return res.render('warning-tip-send', { user: user, id: uuid.v4(), warning: 'wrong password, try it again...' });
        return res.redirect('/account/#sender-wrongpass');
            // if (err === 'INVALID_OTP')
            //     return res.render('tip-send', { user: user, id: uuid.v4(), warning: 'invalid one-time token' });
            //Should be an user
            return next(new Error('Unable to validate user handling withdrawal: \n' + err));
        }

        //Call api to update into wowgo.in

        //to call api
        var request = require('request'),
        username = "pp1",
        password = "12345",
        url = "http://wowgo.in/sock/sock.php",
        auth =  new Buffer(username + ":" + password).toString("base64");

        request(
            {
                url : url,
                headers : {
                    "Authorization" : auth
                },
                data: 'something'
            },
            function (error, response, body) {
                console.log('sock sock', body)
                // Do more stuff with 'body' here
            }
        );


        database.getUserFromUsername(recipientUsername, function(err, data) {
        
            if (err === 'NO_USER')
               return res.redirect('/account/#no-receipt-user');

            if (err)
                return res.redirect('/account/#no-receipt-user');

             var recipient = data;

            if(recipient.id === user.id) 
                return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'You can NOT send tip to yourself.' })

            //return res.render('warning-tip-send', { user: user, id: uuid.v4(), success: 'OK' });
            
            tip(user.id, recipient.id, amount, tipTxId, function(err) {
                if (err) {
                    if (err === 'NOT_ENOUGH_MONEY')
                        return res.render('warning-tip-send', { user: user, id: uuid.v4(), warning: 'Not enough money to send tip.' });
                    else if (err === 'PENDING')
                        return res.render('warning-tip-send', { user: user,  id: uuid.v4(), success: 'Tip submission successful, however hot wallet was empty. Tip will be reviewed and sent ASAP' });
                    else if(err === 'SAME_WITHDRAWAL_ID')
                        return res.render('warning-tip-send', { user: user,  id: uuid.v4(), warning: 'Please reload your page, it looks like you tried to make the same transaction twice.' });
                    else if(err === 'FUNDING_QUEUED')
                        return res.render('warning-tip-send', { user: user,  id: uuid.v4(), success: 'Your transaction is being processed come back later to see the status.' });
                    else
                        return next(new Error('Unable to send tip: ' + err));
                }
                else{ 
                       res.redirect('/account/#tip-send-successfully');       
                    //res.render('support', { user: user, id: uuid.v4(), success: 'OK' });
                }
                
            });

        });
    }); 

        } 
    }
});   
}
    
};



/**
 * GET
 * Restricted API
 * Shows the support page
 **/
exports.contact = function(req, res) {
    assert(req.user);
    res.render('support', { user: req.user })
};
