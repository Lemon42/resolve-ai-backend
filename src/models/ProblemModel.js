const DataValidation = new require('./DataValidation');

class ProblemModel extends DataValidation {
	constructor(title, description) {
		super();
		this.title = this.stringValidation(title);
		this.description = description ? description.trim() : '';
	}
}

module.exports = ProblemModel;