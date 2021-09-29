const DataValidation = new require('./DataValidation');

class Comment extends DataValidation {
	constructor(content) {
		super();
		this.content = this.stringValidation(content, 225);
	}
}

module.exports = Comment;