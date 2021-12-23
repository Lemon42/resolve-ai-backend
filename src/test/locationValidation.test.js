const locationValidation = require('../utils/locationValidation');
const { closeConnection } = require('../database');

test('Valida se uma localização está dentro de uma cidade cadastrada', () => {
	return locationValidation('-23.188773', '-46.8904967').then(response => {
		expect(response).toBe('Jundiaí');
	});
});

afterAll(() => closeConnection(0));