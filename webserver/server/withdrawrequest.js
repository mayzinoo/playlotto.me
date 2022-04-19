var assert = require('assert');
//var ethClient = require('./eth_client');
var database = require('./database');
var request = require('request');
var config = require('../config/config');


module.exports = function(userid, currency_type, amount, currency_amount, country, bank_name, owner_name, account_address, etherum_address, status, withdrawal_id, callback) {
    

    database.requestwithdraw(userid, currency_type, amount, currency_amount, country, bank_name, owner_name, account_address, etherum_address, status, withdrawal_id, function (err, reqId) {
        if (err) {
            if (err.code === '23514')
                callback('NOT_ENOUGH_MONEY');
            else if(err.code === '23505')
                callback('SAME_TIP_ID');
            else
                callback(err);
            return;
        }
        else{ callback(); }
        
    });
};

