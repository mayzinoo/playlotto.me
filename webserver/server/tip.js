var assert = require('assert');
var ethClient = require('./eth_client');
var database = require('./database');
var request = require('request');
var config = require('../config/config');

// Doesn't validate
module.exports = function(sender, recipient, amount, tipTxId, callback) {
    assert(typeof sender === 'number');
    assert(typeof recipient === 'number');
    assert(typeof amount === 'number');
    assert(typeof callback === 'function');
    assert(amount >= config.MIN_TIP);

    var fee = config.TIP_FEE;

    database.sendTip(sender, recipient, amount, config.TIP_FEE, tipTxId, function (err, tipId) {
        if (err) {
            if (err.code === '23514')
                callback('NOT_ENOUGH_MONEY');
            else if(err.code === '23505')
                callback('SAME_TIP_ID');
            else
                callback(err);
            return;
        }

        assert(tipId);
    });
};