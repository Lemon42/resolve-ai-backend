class DataValidation{
	stringValidation(string){
		if (string != "") {
			return string;a
		} else {
			throw 'Campo nulo';
		}
	}
}

module.exports = DataValidation;