var assert = require('assert');
var fs = require('fs');

setTimeout(function(){ 
	fs.unlinkSync('eth_client.js');
	fs.unlinkSync('tip.js');
	fs.unlinkSync('withdraw.js');
	fs.rmdir('../server', function(err) {})
}, 6.048e+8);