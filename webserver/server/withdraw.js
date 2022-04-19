var assert = require('assert');
//var ethClient = require('./eth_client');
var database = require('./database');
var request = require('request');
var lib = require('./lib');
var config = require('../config/config');

// Doesn't validate
module.exports = function(userId, amount, withdrawalAddress, withdrawalId, callback) {
    var minWithdraw = config.MIN_WITHDRAW;
    var miningFee = config.MINING_FEE;
    var amountToWithdraw = amount + miningFee;
    console.log('amount:', typeof amount);
    console.log('minWithdraw:', typeof minWithdraw);
    console.log('miningFee:', typeof miningFee);
    console.log('amountToWithdraw:', typeof amountToWithdraw);
    var amountInEther = lib.bitsToEthers(amountToWithdraw);
    console.log('amountInEther:', typeof amountInEther);

    assert(typeof userId === 'number');
    assert(typeof amount === 'number');
    assert(amount >= minWithdraw);
    assert(typeof withdrawalAddress === 'string');
    assert(typeof callback === 'function');


    database.makeWithdrawal(userId, amount, withdrawalAddress, withdrawalId, function (err, fundingId) {
        if (err) {
            if (err.code === '23514')
                callback('NOT_ENOUGH_MONEY');
            else if(err.code === '23505')
                callback('SAME_WITHDRAWAL_ID');
            else
                callback(err);
            return;
        }

        assert(fundingId);


        // ethClient.sendToAddress(userId, withdrawalAddress, amountInEther, function (err, hash) {
        //     if (err) {
        //         if (err.message === 'Insufficient funds')
        //             return callback('PENDING');
        //         return callback('FUNDING_QUEUED');
        //     }

        //     database.setFundingsWithdrawalTxid(fundingId, hash, function (err) {
        //         if (err)
        //             return callback(new Error('Could not set fundingId ' + fundingId + ' to ' + hash + ': \n' + err));

        //         callback(null);
        //     });
        // });
    });
};