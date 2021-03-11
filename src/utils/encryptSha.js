var CryptoJS = require("crypto-js");

function encryptSHA(pass){
	return CryptoJS.HmacSHA256(JSON.stringify(pass), process.env.SHA_SECRET_KEY).toString();
}

module.exports = encryptSHA;