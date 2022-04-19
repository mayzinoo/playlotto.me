var async = require('async');
var assert = require('assert');
var constants = require('constants');
var fs = require('fs');
var path = require('path');

var config = require('./server/config');
var socket = require('./server/socket');
var database = require('./server/database');
var Game = require('./server/game');
var Chat = require('./server/chat');
var GameHistory = require('./server/game_history');
var PlayHistory = require('./server/play_history');

var _ = require('lodash');

var server;

if (config.USE_HTTPS) {
    var options = {
        key: fs.readFileSync(config.HTTPS_KEY),
        cert: fs.readFileSync(config.HTTPS_CERT),
        secureProtocol: 'SSLv23_method',
        secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_SSLv2
    };

    if (config.HTTPS_CA) {
        options.ca = fs.readFileSync(config.HTTPS_CA);
    }

    server = require('https').createServer(options).listen(config.PORT, function() {
        console.log('Listening on port ', config.PORT, ' on HTTPS!');
    });
} else {
    server = require('http').createServer().listen(config.PORT, function() {
        console.log('Listening on port ', config.PORT, ' with http');
    });
}

// var fs = require('fs');
// var options = {
//     cert: fs.readFileSync('/var/www/playlotto.me/gameserver/ssl_certs/cert.pem'),
//     key: fs.readFileSync('/var/www/playlotto.me/gameserver/ssl_certs/privkey.pem'),
// };

// var serverHttps = https.createServer(options).listen(3842, function() {
//       console.log('Listening on port ',3842, ' on HTTPS!');
//     });


async.parallel([
    database.getGameHistory,
    database.getPlayHistory,
    database.getLastGameInfo,
    database.getBankroll,
    database.getlottosetting
], function(err, results) {
    if (err) {
        console.error('[INTERNAL_ERROR] got error: ', err,
            'Unable to get table history');
        throw err;
    }

    var gameHistory = new GameHistory(results[0]);
    var playHistory = new PlayHistory(results[1]);
    //console.log(gameHistory);
    var info = results[2];
    var bankroll = results[3];
    var setting = results[4];
    

    console.log('Have a bankroll of: ', bankroll/1e8, ' btc');

    var lastGameId = info.id;
    var lastHash = info.hash;
    assert(typeof lastGameId === 'number');

    var game = new Game(lastGameId, lastHash, bankroll, setting, gameHistory, playHistory);
    var chat = new Chat();

    socket(server, game, chat);

});
