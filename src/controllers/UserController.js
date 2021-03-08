const sql = require('mssql');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');

const User = require('../models/UserModel');
const getBlobName = require('../utils/getBlobName');

const blobService = azureStorage.createBlobService();

class UserModel{
	async createUser(req, res){
		try {
			const user = new User(req.body.name, req.body.lastName, req.body.email, req.body.city);
	
			const blobName = getBlobName(req.file.originalname);
			const stream = getStream(req.file.buffer);
			const streamLength = req.file.buffer.length;
	
			blobService.createBlockBlobFromStream(process.env.IMAGES_STORAGE_CONTAINER, blobName, stream, streamLength, err => {
				if (err) {
					handleError(err);
					return;
				}
			});
	
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();
	
			request.input('name', sql.VarChar, user.name);
			request.input('lastName', sql.VarChar, user.lastName);
			request.input('email', sql.VarChar, user.email);
			request.input('city', sql.VarChar, user.city);
			request.input('picture', sql.VarChar, `${process.env.STORAGE_URL}/${process.env.IMAGES_STORAGE_CONTAINER}/${blobName}`);
	
			request.query`INSERT INTO Users (Name, LastName, Email, City, Picture) VALUES 
				(@name, @lastName, @email, @city, @picture)`;
	
			res.sendStatus(200);
	
		} catch (err) {
			console.error(err);
			res.status(400).json({ error: 'Preenchimento invalido de informações!'});
			return;
		}
	}
}

module.exports = UserModel;