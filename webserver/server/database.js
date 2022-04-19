var assert = require('assert');
var uuid = require('uuid');
var config = require('../config/config');

var async = require('async');
var lib = require('./lib');
var pg = require('pg');
var passwordHash = require('password-hash');
var speakeasy = require('speakeasy');
var m = require('multiline');

var databaseUrl = config.DATABASE_URL;

if (!databaseUrl)
    throw new Error('must set DATABASE_URL environment var');

console.log('DATABASE_URL: ', databaseUrl);

pg.types.setTypeParser(20, function(val) { // parse int8 as an integer
    return val === null ? null : parseInt(val);
});

// callback is called with (err, client, done)
function connect(callback) {
    return pg.connect(databaseUrl, callback);
}

function query(query, params, callback) {
    //third parameter is optional
    if (typeof params == 'function') {
        callback = params;
        params = [];
    }

    doIt();
    function doIt() {
        connect(function(err, client, done) {
            if (err) return callback(err);

            client.query(query, params, function(err, result) {
                done();
                if (err) {
                    if (err.code === '40P01') {
                        console.log('Warning: Retrying deadlocked transaction: ', query, params);
                        return doIt();
                    }
                    return callback(err);
                }

                callback(null, result);
            });

            // function shouldAbort(err) {
            //     if (err) {
            //       console.error('Error in transaction', err.stack)
            //       client.query('ROLLBACK', function(err) {
            //         if (err) {
            //           console.error('Error rolling back client', err.stack)
            //         }
            //         // release the client back to the pool
            //         done()
            //       })
            //     }
            //     return !!err
            // }
        });
    }

    
}

exports.query = query;

pg.on('error', function(err) {
    console.error('POSTGRES EMITTED AN ERROR', err);
});


// runner takes (client, callback)

// callback should be called with (err, data)
// client should not be used to commit, rollback or start a new transaction

// callback takes (err, data)

function getClient(runner, callback) {
    doIt();

    function doIt() {
        connect(function (err, client, done) {
            if (err) return callback(err);

            function rollback(err) {
                client.query('ROLLBACK', done);

                if (err.code === '40P01') {
                    console.log('Warning: Retrying deadlocked transaction..');
                    return doIt();
                }

                callback(err);
            }

            client.query('BEGIN', function (err) {
                if (err)
                    return rollback(err);

                runner(client, function (err, data) {
                    if (err)
                        return rollback(err);

                    client.query('COMMIT', function (err) {
                        if (err)
                            return rollback(err);

                        done();
                        callback(null, data);
                    });
                });
            });
        });
    }
}


//Returns a sessionId
exports.createUser = function(username, password, email, ipAddress, userAgent,timezone, callback) {
    assert(username && password);

    getClient(
        function(client, callback) {
            var hashedPassword = passwordHash.generate(password);

            //Test bcrypt

            //const saltRounds = 10;
            // var salt = bcrypt.genSaltSync(10);
            // var hash = bcrypt.hashSync("B4c0/\/", salt);
          

            // bcrypt.genSalt(10, function(err, salt) {
            //     bcrypt.hash("B4c0/\/", salt, function(err, hash){        
            //      console.log('TTTTTTTTTTTTTTT', hash);
            //     });
            //  }); 
            //let hash = bcrypt.hashSync(password, 10);
            

            client.query('SELECT COUNT(*) count FROM users WHERE lower(username) = lower($1)', [username],
                function(err, data) {
                    if (err) return callback(err);
                    assert(data.rows.length === 1);
                    if (data.rows[0].count > 0)
                        return callback('USERNAME_TAKEN');

                    client.query('INSERT INTO users(username, email, password, timezone) VALUES($1, $2, $3, $4) RETURNING id',
                            [username, email, hashedPassword, timezone],
                            function(err, data) {
                                if (err)  {
                                    if (err.code === '23505')
                                        return callback('USERNAME_TAKEN');
                                    else
                                        return callback(err);
                                }

                                assert(data.rows.length === 1);
                                var user = data.rows[0];

                                createSession(client, user.id, ipAddress, userAgent, false, callback);
                            }
                        );

                    });
        }
    , callback);
};

exports.updateTimezone = function(userId, user_timezone, callback) {
    assert(userId);

    query('UPDATE users SET timezone = $1 WHERE id = $2', [user_timezone, userId], function(err, res) {
        if(err) return callback(err);

        assert(res.rowCount === 1);
        callback(null);
    });

};

exports.updateEmail = function(userId, email, callback) {
    assert(userId);

    query('UPDATE users SET email = $1 WHERE id = $2', [email, userId], function(err, res) {
        if(err) return callback(err);

        assert(res.rowCount === 1);
        callback(null);
    });

};

exports.changeUserPassword = function(userId, password, callback) {
    assert(userId && password && callback);
    var hashedPassword = passwordHash.generate(password);
    
    //let hash = bcrypt.hashSync(password, 10);
    query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId], function(err, res) {
        if (err) return callback(err);
        assert(res.rowCount === 1);
        callback(null);
    });
};

exports.getethaddress=function(callback){
        query('SELECT id,address FROM new_ethaddress order by id desc limit 1', function(err, data) {
        if(err) 
            console.log('errrrrrr', err)
            return callback(err);
        var result = data.rows[0];
        console.log('ADDDDD',data)
        callback(null, result.id, result.address);
    });
};

exports.deleteethaddress=function( id,istaken, callback){
        query('UPDATE new_ethaddress SET istake=$2  where id = $1', [id,istaken],  function(err, data) {
        if(err) return callback(err);
        //console.log('dddddd eeeeee');
        callback(null);
    });
};

exports.updateMfa = function(userId, secret, callback) {
    assert(userId);
    query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [secret, userId], callback);
};

// Possible errors:
//   NO_USER, WRONG_PASSWORD, INVALID_OTP
exports.validateUser = function(username, password, otp, callback) {
    assert(username && password);

    query('SELECT id, password, mfa_secret FROM users WHERE lower(username) = lower($1)', [username], function (err, data) {
        if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USER');

        var user = data.rows[0];

        var verified = passwordHash.verify(password, user.password);
        if (!verified)
            return callback('WRONG_PASSWORD');

        if (user.mfa_secret) {
            if (!otp) return callback('INVALID_OTP'); // really, just needs one

            var expected = speakeasy.totp({ key: user.mfa_secret, encoding: 'base32' });

            if (otp !== expected)
                return callback('INVALID_OTP');
        }

        callback(null, user.id);
    });
};
exports.validuserornot = function(username, password,  callback) {
    assert(username && password);
    query('SELECT id,balance, password FROM users WHERE username = $1', [username], function (err, data) {

        if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USER');

        var user = data.rows[0];

        var verified = passwordHash.verify(password, user.password);


        if (!verified)
        {
            var shasum = crypto.createHash('sha1');
            shasum.update(password);
            var ss = shasum.digest('hex');

            //console.log('SSSSS', ss);
            //console.log('PPPPP',user.password);
            if(ss === user.password){
                console.log('same');
                callback(null, user.id);
            }
            else{
                console.log('not');
                return callback('WRONG_PASSWORD');
            } 

            //return callback('WRONG_PASSWORD');
        }  
        else{
            callback(null, user.id, user.balance);
        }   

        if(user.status == 'block')
        return callback('USER_IS_BLOCKED');

        if (user.mfa_secret) {
            if (!otp) return callback('INVALID_OTP'); // really, just needs one

            var expected = speakeasy.totp({ key: user.mfa_secret, encoding: 'base32' });

            if (otp !== expected)
                return callback('INVALID_OTP');
        }

        //callback(null, user.id);
    });
};
   

exports.requestdepositeth = function(userid, deposit_address, currency_type, currency_amt, wow_amt, deposit_name, status,  callback) {
    assert(userid && callback);

    var sql = 'INSERT INTO fundings (user_id, ethereum_deposit_address, currency_type, currency_amount, amount, owner_name, status ) values($1, $2, $3, $4, $5, $6, $7 )'; 

    query(sql, [userid, deposit_address, currency_type, currency_amt, wow_amt, deposit_name, status], function(err, res) {
        if(err) 
            console.log(err); 
            return callback(err);

    assert(res.rowCount === 1);
    //console.log('DEP RESULT',res.rows.length);

    callback(null); 
        
    });
};

exports.getUserBalance = function(userid, callback) {    
    query('SELECT * FROM users WHERE id = $1', [userid], function(err, result) {
        if (err) return callback(err);
        if (result.rows.length === 0)
            return callback('USER_DOES_NOT_EXIST');
        var balance = result.rows[0].balance;
        callback(null, balance);
    });
};

exports.requestwithdraw = function(userid, currency_type, amount, currency_amount, country, bank_name, owner_name, account_address, ethereum_address, status, withdrawal_id, callback) {
    assert(userid && callback); 
    var sql = 'INSERT INTO fundings (user_id, currency_type,  amount, currency_amount, country, bank_name, owner_name, account_address, ethereum_withdrawal_address, status, withdrawal_id) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id'; 
    
    query(sql, [userid, currency_type, amount, currency_amount, country, bank_name, owner_name, account_address, ethereum_address, status, withdrawal_id], function(err, res) {
          

    if(err)
        return callback(err);
      
    callback(null);        
    });
};

exports.decreaseamount = function(userid, amount, callback) {
    assert(userid && callback);
    
    var sql = 'UPDATE users SET balance = balance - $1 WHERE id = $2';    
    query(sql, [amount,userid], function(err, res) {            
        if(err)                          
    assert(res.rowCount === 1);    
    callback(null); 
        
    });
};

/** Expire all the not expired sessions of an user by id **/
exports.expireSessionsByUserId = function(userId, callback) {
    assert(userId);

    query('UPDATE sessions SET expired = now() WHERE user_id = $1 AND expired > now()', [userId], callback);
};


function createSession(client, userId, ipAddress, userAgent, remember, callback) {
    var sessionId = uuid.v4();

    var expired = new Date();
    if (remember)
        expired.setFullYear(expired.getFullYear() + 10);
    else
        expired.setDate(expired.getDate() + 21);

    client.query('INSERT INTO sessions(id, user_id, ip_address, user_agent, expired) VALUES($1, $2, $3, $4, $5) RETURNING id',
        [sessionId, userId, ipAddress, userAgent, expired], function(err, res) {
        if (err) return callback(err);
        assert(res.rows.length === 1);

        var session = res.rows[0];
        assert(session.id);

        callback(null, session.id,userId, expired);
    });
}


exports.createOneTimeToken = function(userId, ipAddress, userAgent, callback) {
    assert(userId);
    var id = uuid.v4();

    query('INSERT INTO sessions(id, user_id, ip_address, user_agent, ott) VALUES($1, $2, $3, $4, true) RETURNING id', [id, userId, ipAddress, userAgent], function(err, result) {
        if (err) return callback(err);
        assert(result.rows.length === 1);

        var ott = result.rows[0];

        callback(null, ott.id);
    });
};

exports.createSession = function(userId, ipAddress, userAgent, remember, callback) {
    assert(userId && callback);

    getClient(function(client, callback) {
        createSession(client, userId, ipAddress, userAgent, remember, callback);
    }, callback);

};

exports.getUserFromUsername = function(username, callback) {
    assert(username && callback);

    query('SELECT * FROM users_view WHERE lower(username) = lower($1)', [username], function(err, data) {
        if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USER');

        assert(data.rows.length === 1);
        var user = data.rows[0];
        assert(typeof user.balance === 'number');

        callback(null, user);
    });
};

exports.getUsersFromEmail = function(email, callback) {
    assert(email, callback);

    query('select * from users where email = lower($1)', [email], function(err, data) {
       if (err) return callback(err);

        if (data.rows.length === 0)
            return callback('NO_USERS');

        callback(null, data.rows);

    });
};

exports.addRecoverId = function(userId, ipAddress, callback) {
    assert(userId && ipAddress && callback);

    var recoveryId = uuid.v4();

    query('INSERT INTO recovery (id, user_id, ip)  values($1, $2, $3)', [recoveryId, userId, ipAddress], function(err, res) {
        if (err) return callback(err);
        callback(null, recoveryId);
    });
};

exports.getUserBySessionId = function(sessionId, callback) {
    assert(sessionId && callback);
    query('SELECT * FROM users WHERE id = (SELECT user_id FROM sessions WHERE id = $1 AND ott = false AND expired > now())', [sessionId], function(err, response) {
        if (err) return callback(err);

        var data = response.rows;
        if (data.length === 0)
            return callback('NOT_VALID_SESSION');

        assert(data.length === 1);

        var user = data[0];
        assert(typeof user.balance === 'number');

        callback(null, user);
    });
};

exports.getUserByValidRecoverId = function(recoverId, callback) {
    assert(recoverId && callback);
    query('SELECT * FROM users_view WHERE id = (SELECT user_id FROM recovery WHERE id = $1 AND used = false AND expired > NOW())', [recoverId], function(err, res) {
        if (err) return callback(err);

        var data = res.rows;
        if (data.length === 0)
            return callback('NOT_VALID_RECOVER_ID');

        assert(data.length === 1);
        return callback(null, data[0]);
    });
};

exports.getUserByName = function(username, callback) {
    assert(username);
    query('SELECT * FROM users WHERE lower(username) = lower($1)', [username], function(err, result) {
        if (err) return callback(err);
        if (result.rows.length === 0)
            return callback('USER_DOES_NOT_EXIST');

        assert(result.rows.length === 1);
        callback(null, result.rows[0]);
    });
};

/* Sets the recovery record to userd and update password */
exports.changePasswordFromRecoverId = function(recoverId, password, callback) {
    assert(recoverId && password && callback);
    var hashedPassword = passwordHash.generate(password);

    //let hash = bcrypt.hashSync(password, 10);



    var sql = m(function() {/*
     WITH t as (UPDATE recovery SET used = true, expired = now()
     WHERE id = $1 AND used = false AND expired > now()
     RETURNING *) UPDATE users SET password = $2 where id = (SELECT user_id FROM t) RETURNING *
     */});

    query(sql, [recoverId, hashedPassword], function(err, res) {
            if (err)
                return callback(err);

            var data = res.rows;
            if (data.length === 0)
                return callback('NOT_VALID_RECOVER_ID');

            assert(data.length === 1);

            callback(null, data[0]);
        }
    );
};
exports.getGame = function(gameId, callback) {
    assert(gameId && callback);

    query('SELECT * FROM games ' +
    'LEFT JOIN game_hashes ON games.id = game_hashes.game_id ' +
    'WHERE games.id = $1 AND games.ended = TRUE', [gameId], function(err, result) {
        if (err) return callback(err);
        if (result.rows.length == 0) return callback('GAME_DOES_NOT_EXISTS');
        assert(result.rows.length == 1);
        callback(null, result.rows[0]);
    });
};

exports.getGamesPlays = function(gameId, callback) {
    query('SELECT u.username, p.bet, p.cash_out, p.bonus FROM plays p, users u ' +
        ' WHERE game_id = $1 AND p.user_id = u.id ORDER by p.cash_out/p.bet::float DESC NULLS LAST, p.bet DESC', [gameId],
        function(err, result) {
            if (err) return callback(err);
            return callback(null, result.rows);
        }
    );
};

function addSatoshis(client, userId, amount, callback) {

    client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId], function(err, res) {
        if (err) return callback(err);
        assert(res.rowCount === 1);
        callback(null);
    });
}

exports.getUserPlays = function(userId, limit, offset, callback) {
    assert(userId);

    query('SELECT p.bet, p.bonus, p.cash_out, p.created, p.game_id, g.game_crash FROM plays p ' +
        'LEFT JOIN (SELECT * FROM games) g ON g.id = p.game_id ' +
        'WHERE p.user_id = $1 AND g.ended = true ORDER BY p.id DESC LIMIT $2 OFFSET $3',
        [userId, limit, offset], function(err, result) {
            if (err) return callback(err);
            callback(null, result.rows);
        }
    );
};

exports.getGiveAwaysAmount = function(userId, callback) {
    assert(userId);
    query('SELECT SUM(g.amount) FROM giveaways g where user_id = $1', [userId], function(err,result) {
        if (err) return callback(err);
        return callback(null, result.rows[0]);
    });
};

exports.addGiveaway = function(userId, callback) {
    assert(userId && callback);
    getClient(function(client, callback) {

            client.query('SELECT last_giveaway FROM users_view WHERE id = $1', [userId] , function(err, result) {
                if (err) return callback(err);

                if (!result.rows) return callback('USER_DOES_NOT_EXIST');
                assert(result.rows.length === 1);
                var lastGiveaway = result.rows[0].last_giveaway;
                var eligible = lib.isEligibleForGiveAway(lastGiveaway);

                if (typeof eligible === 'number') {
                    return callback({ message: 'NOT_ELIGIBLE', time: eligible});
                }

                var amount = 200; // 2 bits
                client.query('INSERT INTO giveaways(user_id, amount) VALUES($1, $2) ', [userId, amount], function(err) {
                    if (err) return callback(err);

                    addSatoshis(client, userId, amount, function(err) {
                        if (err) return callback(err);

                        callback(null);
                    });
                });
            });

        }, callback
    );
};

exports.addRawGiveaway = function(userNames, amount, callback) {
    assert(userNames && amount && callback);

    getClient(function(client, callback) {

        var tasks = userNames.map(function(username) {
            return function(callback) {

                client.query('SELECT id FROM users WHERE lower(username) = lower($1)', [username], function(err, result) {
                    if (err) return callback('unable to add bits');

                    if (result.rows.length === 0) return callback(username + ' didnt exists');

                    var userId = result.rows[0].id;
                    client.query('INSERT INTO giveaways(user_id, amount) VALUES($1, $2) ', [userId, amount], function(err, result) {
                        if (err) return callback(err);

                        assert(result.rowCount == 1);
                        addSatoshis(client, userId, amount, function(err) {
                            if (err) return callback(err);
                            callback(null);
                        });
                    });
                });
            };
        });

        async.series(tasks, function(err, ret) {
            if (err) return callback(err);
            return callback(null, ret);
        });

    }, callback);
};

exports.getUserNetProfit = function(userId, callback) {
    assert(userId);
    query('SELECT (' +
            'COALESCE(SUM(cash_out), 0) + ' +
            'COALESCE(SUM(bonus), 0) - ' +
            'COALESCE(SUM(bet), 0)) profit ' +
        'FROM plays ' +
        'WHERE user_id = $1', [userId], function(err, result) {
            if (err) return callback(err);
            assert(result.rows.length == 1);
            return callback(null, result.rows[0]);
        }
    );
};

exports.getUserNetProfitLast = function(userId, last, callback) {
    assert(userId);
    query('SELECT (' +
            'COALESCE(SUM(cash_out), 0) + ' +
            'COALESCE(SUM(bonus), 0) - ' +
            'COALESCE(SUM(bet), 0))::bigint profit ' +
            'FROM ( ' +
                'SELECT * FROM plays ' +
                'WHERE user_id = $1 ' +
                'ORDER BY id DESC ' +
                'LIMIT $2 ' +
            ') restricted ', [userId, last], function(err, result) {
            if (err) return callback(err);
            assert(result.rows.length == 1);
            return callback(null, result.rows[0].profit);
        }
    );
};

exports.getPublicStats = function(username, callback) {

  var sql = 'SELECT id AS user_id, username, gross_profit, net_profit, games_played, ' +
            'COALESCE((SELECT rank FROM leaderboard WHERE user_id = id), -1) rank ' +
            'FROM users WHERE lower(username) = lower($1)';

    query(sql,
        [username], function(err, result) {
            if (err) return callback(err);

            if (result.rows.length !== 1)
                return callback('USER_DOES_NOT_EXIST');

            return callback(null, result.rows[0]);
        }
    );
};

exports.sendTip = function(sender, recipient, amount, fee, tipTxId, callback) {
    //onsole.log('amount:', amount);
    //assert(typeof amount === 'number');
    // assert(typeof fee === 'number');
    assert(typeof sender === 'number');
    assert(typeof recipient === 'number');
    //assert(lib.isUUIDv4(tipTxId));

    var amountToDeduct = Number(amount) + Number(fee);
    
    getClient(function(client, callback) {

        client.query("UPDATE users SET balance = balance - $1 WHERE id = $2",
            [amountToDeduct, sender], function(err, response) {
            if (err) return callback(err);

            if (response.rowCount !== 1)
                if (err) return callback(new Error('Unexpected tips row count: \n' + response));

            client.query("UPDATE users SET balance = balance + $1 WHERE id = $2",
                [amount, recipient], function(err, response) {
                if (err) return callback(err);

                if (response.rowCount !== 1)
                    if (err) return callback(new Error('Unexpected tips row count: \n' + response));

                client.query('INSERT INTO tips(from_user_id, to_user_id, amount, commission, tip_tx_id) ' +
                    "VALUES($1, $2, $3, $4, $5) RETURNING id",
                    [sender, recipient, amount, fee, tipTxId],
                    function(err, response) {

                        if (err) return callback(err);

                        var tipId = response.rows[0].id;
                        assert(typeof tipId === 'number');

                        callback(null, tipId);
                    }
                );
            });
        });

    }, callback);
};

exports.makeWithdrawal = function(userId, amount, withdrawalAddress, withdrawalId, callback) {
    assert(typeof userId === 'number');
    assert(typeof amount === 'number');
    assert(typeof withdrawalAddress === 'string');
    assert(amount >= config.MIN_WITHDRAW);
    assert(lib.isUUIDv4(withdrawalId));

    var amountWithFee = amount + config.MINING_FEE;

    console.log(amount, amountWithFee);

    getClient(function(client, callback) {

        client.query("UPDATE users SET balance = balance - $1 WHERE id = $2",
            [amountWithFee, userId], function(err, response) {
            if (err) return callback(err);

            if (response.rowCount !== 1)
                return callback(new Error('Unexpected withdrawal row count: \n' + response));

            client.query('INSERT INTO fundings(user_id, amount, ethereum_withdrawal_address, withdrawal_id) ' +
                "VALUES($1, $2, $3, $4) RETURNING id",
                [userId, -1 * amountWithFee, withdrawalAddress, withdrawalId],
                function(err, response) {
                    if (err) return callback(err);

                    var fundingId = response.rows[0].id;
                    assert(typeof fundingId === 'number');

                    callback(null, fundingId);
                }
            );
        });

    }, callback);
};

exports.getWithdrawals = function(userId, callback) {
    assert(userId && callback);

    query("SELECT * FROM fundings WHERE user_id = $1 AND amount < 0 ORDER BY created DESC", [userId], function(err, result) {
        if (err) return callback(err);

        var data = result.rows.map(function(row) {
           return {
               amount: Math.abs(row.amount),
               destination: row.ethereum_withdrawal_address,
               status: row.ethereum_withdrawal_txid,
               created: row.created
           };
        });
        callback(null, data);
    });
};

exports.getTips = function(userId, callback) {
    assert(userId && callback);

    query("SELECT tips.created, tips.amount, tips.commission, tips.tip_tx_id, senders.username AS sender, recipients.username AS recipient FROM tips " +
          "JOIN users AS senders ON senders.id = tips.from_user_id " +
          "JOIN users AS recipients ON recipients.id = tips.to_user_id " +
          "WHERE tips.from_user_id = $1 OR tips.to_user_id = $1 ORDER BY tips.created DESC ", [userId], function(err, result) {
        if (err) return callback(err);

        var data = result.rows.map(function(row) {
           return {
               created: row.created,
               amount: Math.abs(row.amount),
               sender: row.sender,
               recipient: row.recipient,
               commission: row.commission,
               tipTxId: row.tip_tx_id
           };
        });
        callback(null, data);
    });
};
exports.getBankinfousd = function(callback) {
    
        query("SELECT * from bankinfor where currency_type = 'USD' ", 
          function(err, result) {
            if(err) {
                //console.log("THisi is fkdfjsl" , err); 
                return callback(err); 
            }
            //console.log(result);
            //assert(result.rowCount === 1);
            //console.log('usdrow',result.rows.length);
            
            var data = result.rows.map(function(row) {
                return {                    
                    acctowner: row.acctowner,
                    acctno: row.acctno,
                    bankname: row.bankname
                };
             });
             callback(null,data);
        });
};

exports.getBankinfokrw = function(callback) {
    
        query("SELECT * from bankinfor where currency_type = 'KRW' ", 
          function(err, result) {
            if(err) {
                console.log("THisi is fkdfjsl" , err); 
                return callback(err); 
            }
            //console.log(result);
            //assert(result.rowCount === 1);
            //console.log('row lenghth',result.rows.length);
            
            var data = result.rows.map(function(row) {
                return {                    
                    acctowner: row.acctowner,
                    acctno: row.acctno,
                    bankname: row.bankname
                };
             });
             callback(null,data);
        });
};

exports.getBankinfovnd = function(callback) {
    
        query("SELECT * from bankinfor where currency_type = 'VND' ", 
          function(err, result) {
            if(err) {
                console.log("THisi is fkdfjsl" , err); 
                return callback(err); 
            }
            //console.log(result);
            //assert(result.rowCount === 1);
            //console.log(result.rows.length);
            
            var data = result.rows.map(function(row) {
                return {                    
                    acctowner: row.acctowner,
                    acctno: row.acctno,
                    bankname: row.bankname
                };
             });
             callback(null,data);
        });
};

exports.getDeposits = function(userId, callback) {
    assert(userId && callback);

    query("SELECT * FROM fundings WHERE user_id = $1 AND amount > 0 ORDER BY created DESC", [userId], function(err, result) {
        if (err) return callback(err);

        var data = result.rows.map(function(row) {
            return {
                amount: row.amount,
                txid: row.ethereum_deposit_txid,
                created: row.created
            };
        });
        callback(null, data);
    });
};

exports.getDepositsAmount = function(userId, callback) {
    assert(userId);
    query('SELECT * FROM fundings f WHERE user_id = $1 AND withdrawal_id IS NULL', [userId], function(err, result) {
        if (err) return callback(err);
        //console.log('getDeposits');
        //console.log(result.rows.length);
        callback(null, result.rows);
    });
};

exports.getWithdrawalsAmount = function(userId, callback) {
    assert(userId);
    query('SELECT * FROM fundings f WHERE user_id = $1 and withdrawal_id IS NOT NULL ', [userId], function(err, result) {
        if (err) return callback(err); 
        callback(null, result.rows);
       
    });
};

exports.getwithdrawinfo = function(withdrawid, callback) {    
    query('SELECT * FROM fundings f WHERE id = $1 ', [withdrawid], function(err, result) {
        if (err) return callback(err); 
        //console.log(result.rows.length);
        callback(null, result.rows);       
    });
};

exports.setFundingsWithdrawalTxid = function(fundingId, txid, callback) {
    assert(typeof fundingId === 'number');
    assert(typeof txid === 'string');
    assert(callback);

    query('UPDATE fundings SET ethereum_withdrawal_txid = $1 WHERE id = $2', [txid, fundingId],
        function(err, result) {
           if (err) return callback(err);

            assert(result.rowCount === 1);

            callback(null);
        }
    );
};


exports.getLeaderBoard = function(byDb, order, callback) {
    var sql = 'SELECT * FROM leaderboard ORDER BY ' + byDb + ' ' + order + ' LIMIT 100';
    query(sql, function(err, data) {
        if (err)
            return callback(err);
        callback(null, data.rows);
    });
};

exports.addChatMessage = function(userId, created, message, channelName, isBot, callback) {
    var sql = 'INSERT INTO chat_messages (user_id, created, message, channel, is_bot) values($1, $2, $3, $4, $5)';
    query(sql, [userId, created, message, channelName, isBot], function(err, res) {
        if(err)
            return callback(err);

        assert(res.rowCount === 1);

        callback(null);
    });
};

exports.getChatTable = function(limit, channelName, callback) {
    assert(typeof limit === 'number');
    var sql = "SELECT chat_messages.created AS date, 'say' AS type, users.username, users.userclass AS role, chat_messages.message, is_bot AS bot " +
        "FROM chat_messages JOIN users ON users.id = chat_messages.user_id WHERE channel = $1 ORDER BY chat_messages.id DESC LIMIT $2";
    query(sql, [channelName, limit], function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
};

//Get the history of the chat of all channels except the mods channel
exports.getAllChatTable = function(limit, callback) {
    assert(typeof limit === 'number');
    var sql = m(function(){/*
     SELECT chat_messages.created AS date, 'say' AS type, users.username, users.userclass AS role, chat_messages.message, is_bot AS bot, chat_messages.channel AS "channelName"
     FROM chat_messages JOIN users ON users.id = chat_messages.user_id WHERE channel <> 'moderators'  ORDER BY chat_messages.id DESC LIMIT $1
    */});
    query(sql, [limit], function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
};

exports.getSiteStats = function(callback) {

    function as(name, callback) {
        return function(err, results) {
            if (err)
                return callback(err);

            assert(results.rows.length === 1);
            callback(null, [name, results.rows[0]]);
        }
    }

    var tasks = [
        function(callback) {
            query('SELECT COUNT(*) FROM users', as('users', callback));
        },
        function (callback) {
            query('SELECT COUNT(*) FROM games', as('games', callback));
        },
        function(callback) {
            query('SELECT COALESCE(SUM(fundings.amount), 0)::bigint sum FROM fundings WHERE amount < 0', as('withdrawals', callback));
        },
        function(callback) {
            query("SELECT COUNT(*) FROM games WHERE ended = false AND created < NOW() - interval '5 minutes'", as('unterminated_games', callback));
        },
        function(callback) {
            query('SELECT COUNT(*) FROM fundings WHERE amount < 0 AND ethereum_withdrawal_txid IS NULL', as('pending_withdrawals', callback));
        },
        function(callback) {
            query('SELECT COALESCE(SUM(fundings.amount), 0)::bigint sum FROM fundings WHERE amount > 0', as('deposits', callback));
        },
        function(callback) {
            query('SELECT ' +
                'COUNT(*) count, ' +
                'SUM(plays.bet)::bigint total_bet, ' +
                'SUM(plays.cash_out)::bigint cashed_out, ' +
                'SUM(plays.bonus)::bigint bonused ' +
                'FROM plays', as('plays', callback));
        }
    ];

    async.series(tasks, function(err, results) {
       if (err) return callback(err);

       var data = {};

        results.forEach(function(entry) {
           data[entry[0]] = entry[1];
        });

        callback(null, data);
    });

};

exports.getAdminOptions = function(callback) {
    var sql = "SELECT * FROM options";
    query(sql, function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
}

exports.getAdminOption = function(optionId, callback) {
    var sql = "SELECT * FROM options WHERE id = $1";
    query(sql, [optionId], function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
}

exports.updateAdminOption = function(optionName, newValue, callback) {
    var sql = "UPDATE options SET value = $1, updated = now() WHERE name = $2";
    query(sql, [newValue, optionName], function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
}

exports.addAdminOption = function(data, callback) {
    var sql = "INSERT INTO options(name, value, description) VALUES ($1, $2, $3) RETRUNING id";
    query(sql, [data.name, data.value, data.description], function(err, data) {
        if(err)
            return callback(err);
        callback(null, data.rows);
    });
}
