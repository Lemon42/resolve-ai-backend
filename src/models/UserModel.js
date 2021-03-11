const DataValidation = new require('./DataValidation');
const invalidPassList =  require('../utils/invalidPassList');

class User extends DataValidation {
	constructor(name, lastName, email, city, pass) {
		super();
		this.name = this.stringValidation(name);
		this.lastName = this.stringValidation(lastName);
		this.email = this.stringValidation(email);
		this.city = this.stringValidation(city);
		this.pass = this.passValidation(pass);
	}

	passValidation(pass){
		console.log(pass)
		if(pass.length <= 7){
			throw 'Senha invalida, muito curta!';
		}

		let isValid = true;
		invalidPassList.forEach((item => {
			if (item == pass) {
				isValid = false;
			}
		}))

		if (!isValid){
			throw 'Senha invalida!';
		}

		return pass;
	}
}

module.exports = User;