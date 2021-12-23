const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '..', '.env.testing') });

module.exports = async () => {
	console.log('\nConfiguração inicial antes dos testes');
};