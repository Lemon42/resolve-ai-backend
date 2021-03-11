const sql = require('mssql');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');

const User = require('../models/UserModel');
const encrypt = require('../utils/encryptSha');
const getBlobName = require('../utils/getBlobName');

const blobService = azureStorage.createBlobService();

class UserModel{
	async createUser(req, res){
		try {
			const user = new User(req.body.name, req.body.lastName, req.body.email, req.body.city, req.body.pass);
			user.pass = encrypt(user.pass);

			// Teste para ver se o email já está cadastrado
			const pool = await sql.connect(require('../config/databaseConfig'));
			const emailValidateRequest = pool.request();
	
			emailValidateRequest.input('newEmail', sql.VarChar, req.body.email);
	
			const result = await emailValidateRequest.query`SELECT Email FROM Users WHERE Email = @newEmail`;
	
			if(result.rowsAffected >= 1){
				throw 'Email já cadastrado!';
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
		
				blobService.createBlockBlobFromStream(process.env.IMAGES_STORAGE_CONTAINER, imageName, stream, streamLength, err => {
					if (err) {
						handleError(err);
						return;
					}
				});
			}
	
			// Envio para o servido
			const request = pool.request();
	
			request.input('name', sql.VarChar, user.name);
			request.input('lastName', sql.VarChar, user.lastName);
			request.input('email', sql.VarChar, user.email);
			request.input('city', sql.VarChar, user.city);
			request.input('picture', sql.VarChar, `${process.env.STORAGE_URL}/${imageContainer}/${imageName}`);
			request.input('pass', sql.VarChar, user.pass);
	
			request.query`INSERT INTO Users (Name, LastName, Email, City, Picture, Pass) VALUES 
				(@name, @lastName, @email, @city, @picture, @pass)`;

			res.sendStatus(200);
			
		} catch (err) {
			console.error(err);
			res.status(400).json({ error: 'Preenchimento invalido de informações!', type: err});
			return;
		}
	}
}

module.exports = UserModel;