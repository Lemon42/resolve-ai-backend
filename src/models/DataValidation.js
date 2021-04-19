class DataValidation{
	stringValidation(string){
		if (string != "") {
			return string.trim();
		} else {
			throw 'Campo nulo';
		}
	}
}

module.exports = DataValidation;