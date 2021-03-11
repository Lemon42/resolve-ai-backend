class DataValidation{
	stringValidation(string){
		if (string != "") {
			return string;
		} else {
			throw 'Campo nulo';
		}
	}
}

module.exports = DataValidation;