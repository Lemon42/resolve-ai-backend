const routes = require('express').Router();

const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();
const uploadStrategy = multer({ storage: inMemoryStorage }).single('picture');

const azureStorage = require('azure-storage');
const blobService = azureStorage.createBlobService();

const getStream = require('into-stream');
const containerName = process.env.IMAGES_STORAGE_CONTAINER;

const getBlobName = originalName => {
	const identifier = Math.random().toString().replace(/0\./, ''); // remove "0." from start of string
	return `${identifier}-${originalName}`;
};


const User = require('./views/UserView');
const sql = require('mssql');

routes.post('/create-user', uploadStrategy, async (req, res) => {
	try {
		const user = new User(req.body.name, req.body.lastName, req.body.email, req.body.city);

		const blobName = getBlobName(req.file.originalname);
		const stream = getStream(req.file.buffer);
		const streamLength = req.file.buffer.length;
	
		blobService.createBlockBlobFromStream(containerName, blobName, stream, streamLength, err => {
			if (err) {
				handleError(err);
				return;
			}
		});

		const pool = await sql.connect(require('./config/databaseConfig'));
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
		res.status(400).json({ error: 'Preenchimento invalido de informações!' });
		return;
	}
});

module.exports = routes;