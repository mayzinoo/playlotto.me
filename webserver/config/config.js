/**
 * For development you can set the variables by creating a .env file on the root
 */
require('dotenv').config();

var fs = require('fs');
var isProduction = process.env.NODE_ENV === 'production';

var prodConfig = null;
if(isProduction) {
  prodConfig = JSON.parse(fs.readFileSync(__dirname + '/build-config.json'));
  console.log('Build config loaded: ', prodConfig);
}

const jsonRpcProvider = {
  'url': 'http://localhost:8546',
  'user': null,
  'password': null,
  'allowInsecure': false
}

module.exports = {
  "PRODUCTION": isProduction,
  "DATABASE_URL": process.env.DATABASE_URL || "postgres://wowgo:wowgo@localhost:5432/wowgodb",
  "BIP32_DERIVED": process.env.BIP32_DERIVED_KEY,
  "AWS_SES_KEY": process.env.AWS_SES_KEY,
  "AWS_SES_SECRET": process.env.AWS_SES_SECRET,
  "CONTACT_EMAIL": process.env.CONTACT_EMAIL || "admin@company.com",
  "SITE_URL": process.env.SITE_URL || "http://localhost:3841",
  "ENC_KEY": process.env.ENC_KEY || "devkey",
  "SIGNING_SECRET": process.env.SIGNING_SECRET || "secret",
  "BANKROLL_OFFSET": parseInt(process.env.BANKROLL_OFFSET) || 0,
  "RECAPTCHA_PRIV_KEY": process.env.RECAPTCHA_PRIV_KEY || '6LcYl7wUAAAAAOgxHauisye6H7GHusDbd5AaNlEV',
  "RECAPTCHA_SITE_KEY": process.env.RECAPTCHA_SITE_KEY || '6LcYl7wUAAAAAOThWc-9zSHmi5tTuNJzPGAwTxa3',
  "ETHEREUM_PROVIDER": process.env.ETHEREUM_PROVIDER || jsonRpcProvider,
  "MNEMONIC": process.env.MNEMONIC || 'cherry you receive shuffle ski wise youth roof shield private shaft shield',
  "BITCOIND_HOST": process.env.BITCOIND_HOST,
  "BITCOIND_PORT": process.env.BITCOIND_PORT || 8332,
  "BITCOIND_USER": process.env.BITCOIND_USER,
  "BITCOIND_PASS": process.env.BITCOIND_PASS,
  "BITCOIND_CERT": process.env.BITCOIND_CERT  || '',
  "PORT":  process.env.PORT || 3841,
  "MINING_FEE": Number(process.env.MINING_FEE || 10000),
  "TIP_FEE": Number(process.env.TIP_FEE || 0),
  "MIN_WITHDRAW": Number(process.env.MIN_WITHDRAW || 1000),
  "MIN_TIP": Number(process.env.MIN_TIP || 0),
  "BIT_TO_ETH_RATIO": Number(process.env.BIT_TO_ETH_RATIO || 0),
  "BUILD": prodConfig
};







