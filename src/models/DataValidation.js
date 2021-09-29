class DataValidation{
	stringValidation(string, maxLength){
		var newString = string;
	
		if (string != "") {
			newString = string.trim();
		} else {
			throw 'Campo nulo';
		}

		if(maxLength){
			if(newString.length > maxLength){
				throw 'Tamanho inválido';
			}
		}

		return newString;
	}
}

module.exports = DataValidation;