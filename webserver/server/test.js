const Tx = require('ethereumjs-tx').Transaction;
const ethers = require('ethers');
const Web3 = require('web3');
const config = require('../config/config');

const web3 = new Web3(new Web3.providers.HttpProvider(config.ETHEREUM_PROVIDER));
const provider = new ethers.providers.Web3Provider(web3.currentProvider);
const wallet = ethers.Wallet.fromMnemonic(config.MNEMONIC).connect(provider);

const masterNode = ethers.utils.HDNode.fromMnemonic(config.MNEMONIC);

console.log(`\nRoot:\n`);
console.log('xprv:', masterNode.extendedKey);
console.log('xpub:', masterNode.neuter().extendedKey);


deriveAddress = function(index) {
    var path = `m/44'/60'/0'/0/${index}`;
    let childNode = masterNode.derivePath(path);

    console.log(`\nChild ${index}:\n`);

    let xprv = childNode.extendedKey;
    let xpub = childNode.neuter().extendedKey;
    
    console.log('xprv:', xprv);
    console.log('xpub:', xpub);

    return childNode.address;
};
// console.log(deriveAddress(1), '\n\n')

derive = function(index) {
    var path = `m/44'/60'/0'/0/${index}`;
    let childNode = masterNode.derivePath(path);

    return { 
    	privateKey: childNode.privateKey,
	    publicKey: childNode.publicKey,
	    address: childNode.address,
   	}
};

initiatDeposit = function(senderId, recipientId) {

	var sender = derive(senderId);
	var recipient = derive(recipientId);

	console.log('Sender:', sender);
	console.log('Recipient:', recipient);

	web3.eth.getTransactionCount(sender.address, function(err, txCount) {
		const txObject = {
			nonce: web3.utils.toHex(txCount),
			to: recipient.address,
			value: web3.utils.toHex(web3.utils.toWei('1', 'ether')),
			gasLimit: web3.utils.toHex(90000),
			gasPrice: web3.utils.toHex(20000000000)
		}


		const tx = new Tx(txObject);
		tx.sign(Buffer.from(sender.privateKey.replace(/0x/, ''), 'hex'));

		const serializedTx = tx.serialize();
		const raw = '0x' + serializedTx.toString('hex');

		web3.eth.sendSignedTransaction(raw, function(err, txHash){
			if(err) console.log(err);
			console.log('txHash:', txHash);
		})
	});

}

initiatDeposit(2, 1);
// provider.getBalance('0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8').then(balance => console.log(ethers.utils.formatEther(balance)) );