var CBuffer = require('CBuffer');
var database = require('./database');
var _ = require('lodash');

function PlayHistory (playTable) {
    var self = this;
    self.playTable = new CBuffer(20);
    playTable.forEach(function(play) {
        self.playTable.push(play);
    });
}

PlayHistory.prototype.addCompletedPlay = function (play) {
	//console.log(play);
    this.playTable.unshift(play);
};

PlayHistory.prototype.getHistory = function () {
	//console.log(this.playTable.toArray())
    return this.playTable.toArray();
};

module.exports = PlayHistory;
