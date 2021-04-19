class DataValidation{
	stringValidation(string){
		if (string != "") {
			return trim(string);
		} else {
			throw 'Campo nulo';
		}
	}
}

module.exports = DataValidation;