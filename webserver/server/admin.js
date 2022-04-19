var assert = require('assert');
var async = require('async');
var database = require('./database');
var config = require('../config/config');

/**
 * The req.user.admin is inserted in the user validation middleware
 */

exports.options = function(req, res) {
    var user = req.user;
    assert(user.admin);

    var options = [];
    database.getAdminOptions(function(err, data) {
        if(err) return next('Problem with database...');

        options = data;
        res.render('options', { user: user, options: options });
    })
}

exports.updateOptions = function(req, res) {
    var options = req.body;

    Object.keys(options).forEach(function(name) {
        database.updateAdminOption(name, options[name], function(err, data) {
            if(err) return next('Problem with database...');

            options = data;
            res.render('options');
        })
    })
    
}

exports.giveAway = function(req, res) {
    var user = req.user;
    assert(user.admin);
    res.render('giveaway', { user: user });
};

exports.giveAwayHandle = function(req, res, next) {
    var user = req.user;
    assert(user.admin);

    if (config.PRODUCTION) {
        var ref = req.get('Referer');
        if (!ref) return next(new Error('Possible xsfr')); //Interesting enough to log it as an error

        if (ref.lastIndexOf('https://www.bustabit.com/admin-giveaway', 0) !== 0)
            return next(new Error('Bad referrer got: ' + ref));
    }

    var giveAwayUsers = req.body.users.split(/\s+/);
    var bits = parseFloat(req.body.bits);

    if (!Number.isFinite(bits) || bits <= 0)
        return next('Problem with bits...');

    var satoshis = Math.round(bits * 100);

    database.addRawGiveaway(giveAwayUsers, satoshis , function(err) {
        if (err) return res.redirect('/admin/giveaway?err=' + err);

        res.redirect('/admin/giveaway?m=Done');
    });
};