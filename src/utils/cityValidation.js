function cityValidation(city){
	const validCities = [
		['Jundiaí'],
		['Várzea Paulista'],
		['Campo Limpo Paulista'],
		['Vinhedo'],
		['Cabreúva'],
		['Louveira']
	];

	let isValid = false;

	validCities.forEach((item) => {
		if (item == city){
			isValid = true;
		}
	});

	return isValid;
}

module.exports = cityValidation;