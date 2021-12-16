const cityValidation = require('../utils/cityValidation');

test('Valida se o texto corresponde a uma cidade cadastrada', () => {
	expect(cityValidation('Vinhedo')).toBe(true);
	expect(cityValidation('Jundiaí')).toBe(true);
	expect(cityValidation('Nada')).toBe(false);
});