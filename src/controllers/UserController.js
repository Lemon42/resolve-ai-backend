const sql = require('mssql');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
const cryptoJS = require('crypto-js');

const User = require('../models/UserModel');
const encrypt = require('../utils/encryptSha');
const getBlobName = require('../utils/getBlobName');

const blobService = azureStorage.createBlobService();

class UserModel{
	async createUser(req, res){
		try {
			const user = new User(req.body.name, req.body.lastName, req.body.email, req.body.city, req.body.pass);
			user.pass = encrypt(user.pass);

			const pool = await sql.connect(require('../config/databaseConfig'));

			// Teste para ver se o email já está cadastrado
			const emailValidateRequest = pool.request();
	
			emailValidateRequest.input('newEmail', sql.VarChar, req.body.email);
			const emailResult = await emailValidateRequest.query`SELECT Email FROM Users WHERE Email = @newEmail`;

			if(emailResult.rowsAffected >= 1){
				throw 'Email já cadastrado!';
			}

			// Teste para ver se a cidade pode ser cadastrada
			const cityValidateRequest = pool.request();
	
			cityValidateRequest.input('newCity', sql.VarChar, req.body.city);
			const cityResult = await cityValidateRequest.query`SELECT Name FROM City WHERE Name = @newCity`;

			if(cityResult.rowsAffected != 1){
				throw 'Não estamos nessa cidade';
			}

			// Cadastro da imagem de perfil
			let imageName = '';
			let imageContainer = '';

			if(typeof req.file === 'undefined') { // cadastro de imagem padrão
				imageName = 'default-user-image.png';
				imageContainer = 'project';
			} else { // envio de imagem do usuário
				imageName = getBlobName(req.file.originalname)
				imageContainer = process.env.IMAGES_STORAGE_CONTAINER;
				const stream = getStream(req.file.buffer);
				const streamLength = req.file.buffer.length;
		
				blobService.createBlockBlobFromStream(imageContainer, imageName, stream, streamLength, err => {
					if (err) {
						handleError(err);
						return;
					}
				});
			}
	
			// Envio para o servidor
			const request = pool.request();
	
			request.input('name', sql.VarChar, user.name);
			request.input('lastName', sql.VarChar, user.lastName);
			request.input('email', sql.VarChar, user.email);
			request.input('city', sql.VarChar, user.city);
			request.input('picture', sql.VarChar, `${process.env.STORAGE_URL}/${imageContainer}/${imageName}`);
			request.input('pass', sql.VarChar, user.pass);
	
			request.query`INSERT INTO Users (Name, LastName, Email, City, Picture, Pass) VALUES 
				(@name, @lastName, @email, @city, @picture, @pass)`;

			res.sendStatus(201);
			
		} catch (err) {
			console.error(err);
			res.json({ error: 'Preenchimento invalido de informações!', type: err});
			return;
		}
	}

	async authenticationUser(req, res){
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		request.input('email', sql.VarChar, req.body.email);
		request.input('pass', sql.VarChar, encrypt(req.body.pass));

		const user = await request.query`SELECT * FROM Users WHERE Email = @email AND Pass = @pass`;
		
		if(user.rowsAffected == 1){ // Autenticado
			if(req.body.type == 'mobile' || req.body.type == 'desktop'){
				const token = cryptoJS.MD5(Math.random().toString().replace(/0\./, '')).toString();
				request.query`INSERT INTO Authentications
					(Token, Account, AccountType, CreateDate)
					VALUES (${token}, @email, ${req.body.type}, GETDATE())`;

				res.json({
					token: token,
					email: user.recordset[0].Email,
					picture: user.recordset[0].Picture,
					name: user.recordset[0].Name,
					lastName: user.recordset[0].LastName
				})
			} else {
				res.json({ error: 'Tipo de conta inválida' });
			}
		} else { // Não autenticado
			res.json({ error: 'Credenciais inválidas!' });
		}
	}

	async logout(req, res) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		request.input('token', sql.VarChar, req.body.token);
		request.input('email', sql.VarChar, req.body.email);

		const response = await request.query`DELETE FROM Authentications 
			WHERE account = @email AND token = @token`;

		if(response.rowsAffected == 1){
			res.sendStatus(200);
		} else {
			res.json({ error: 'Credenciais invalidas!'});
		}
	}
}

module.exports = UserModel;