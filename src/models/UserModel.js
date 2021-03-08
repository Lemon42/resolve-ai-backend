const DataValidation = new require('./DataValidation');

class User extends DataValidation {
	constructor(name, lastName, email, city) {
		super();
		this.name = this.stringValidation(name);
		this.lastName = this.stringValidation(lastName);
		this.email = this.stringValidation(email);
		this.city = this.stringValidation(city);
	}
}

module.exports = User;