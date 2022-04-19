const fs = require('fs');
const ethers = require('ethers');
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const lib = require('./lib')
const config = require('../config/config');

const web3 = new Web3(new Web3.providers.HttpProvider(config.ETHEREUM_PROVIDER));
const provider = new ethers.providers.Web3Provider(web3.currentProvider);
const client = ethers.Wallet.fromMnemonic(config.MNEMONIC).connect(provider);
const masterNode = ethers.utils.HDNode.fromMnemonic(config.MNEMONIC);

client.sendToAddress = function(userId, address, amount, callback) {

	var sender = lib.derive(userId);

	web3.eth.getTransactionCount(sender.address, function(err, txCount) {
		const txObject = {
			nonce: web3.utils.toHex(txCount),
			to: address,
			value: web3.utils.toHex(web3.utils.toWei(amount.toString(), 'ether')),
			gasLimit: web3.utils.toHex(90000),
			gasPrice: web3.utils.toHex(20000000000)
		}

		const tx = new Tx(txObject);
		tx.sign(Buffer.from(sender.privateKey.replace(/0x/, ''), 'hex'));

		const serializedTx = tx.serialize();
		const raw = '0x' + serializedTx.toString('hex');

		web3.eth.sendSignedTransaction(raw, callback)
	});

}


module.exports = client;