const Web3 = require('web3');
const ethers = require('ethers');
const hdkey = require('HDKey');
const bip39 = require('bip39');
const ethTx = require('ethereumjs-tx');
const ethUtil = require('ethereumjs-util');
const config = require('../config/config');

// AVOID THIS METHOD: This somehow lands inaccurate keys as opposed to test.js

// const mnemonic = 'cherry you receive shuffle ski wise youth roof shield private shaft shield';
console.log('MNEMONIC:', config.MNEMONIC);

bip39.mnemonicToSeed(config.MNEMONIC)
.then(res => {
	const seed = res.toString('hex');
	console.log(seed);

	const root = hdkey.fromMasterSeed(seed);
	const xprv = root.privateExtendedKey.toString('hex');
	const xpub = root.publicExtendedKey.toString('hex');

	console.log(`\nRoot:\n`);

	console.log('xprv:', xprv);
	console.log('xpub:', xpub);

	deriveAddress = function(index) {
	    var path = `m/44'/60'/0'/0/${index}`;

	    let childNode = root.derive(path);
	    console.log(`\nChild ${index}:\n`);

	    let xprv = childNode.privateExtendedKey.toString('hex');
	    let xpub = childNode.publicExtendedKey.toString('hex');

	    console.log('xprv:', xprv);
	    console.log('xpub:', xpub);

	    let pubKey = ethUtil.privateToPublic(childNode._privateKey);

	    let addr = ethUtil.publicToAddress(pubKey).toString('hex');
	    let address = ethUtil.toChecksumAddress(addr);
	    return address;
	};

	console.log(deriveAddress(3), '\n\n');
	
});





