const sql = require('mssql');
const emailValidator = require('email-validator');

const DataValidation = new require('./DataValidation');
const invalidPassList =  require('../utils/invalidPassList');

class User extends DataValidation {
	constructor(name, lastName, email, city, pass) {
		super();
		this.name = this.stringValidation(name);
		this.lastName = lastName ? lastName.trim() : '';
		this.city = this.stringValidation(city);
		this.pass = this.passValidation(pass);
		
		this.email = email.trim().toLowerCase();
		this.email = this.emailValidation(this.email);
	}

	emailValidation(email) {
		if(!emailValidator.validate(email)){
			throw 'Email inválido!';
		}

		return email;
	}

	passValidation(pass) {
		if(pass.length <= 7){
			throw 'Senha inválida, muito curta!';
		}

		let isValid = true;
		invalidPassList.forEach((item => {
			if (item == pass) {
				isValid = false;
			}
		}))

		if (!isValid){
			throw 'Senha inválida!';
		}

		return pass;
	}
}

module.exports = User;