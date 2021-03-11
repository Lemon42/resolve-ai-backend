var CryptoJS = require("crypto-js");

function encryptSHA(pass){
	return CryptoJS.HmacSHA256(JSON.stringify(pass), process.env.AES_SECRET_KEY).toString();
}

module.exports = encryptSHA;