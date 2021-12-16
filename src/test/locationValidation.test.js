// Configurando variaveis de ambiente
const path = require('path');
require('dotenv').config({
	path: path.resolve(__dirname, '..', '..', '.env.testing')
});

const locationValidation = require('../utils/locationValidation');

test('Valida se uma localização está dentro de uma cidade valida', () => {
	return locationValidation('-23.188773', '-46.8904967').then(response => {
		expect(response).toBe('Jundiaí');
	});
});