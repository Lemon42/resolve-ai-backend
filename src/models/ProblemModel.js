const DataValidation = new require('./DataValidation');

class ProblemModel extends DataValidation {
	constructor(title, description) {
		super();
		this.title = this.stringValidation(title, 45);

		if(description){
			this.description = this.stringValidation(description, 480);;
		} else {
			this.description = '';
		}
	}
}

module.exports = ProblemModel;