const { poolPromise, sql } = require('../database');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
const getBlobName = require('../utils/getBlobName');

const Problem = require('../models/ProblemModel');

const errorHandling = require('../utils/errorHandling');;
const locationValidation = require('../utils/locationValidation');
const cityValidation = require('../utils/cityValidation');

const blobService = azureStorage.createBlobService();

class SolvedProblemController {
	async create(req, res) {
		try {
			const pool = await poolPromise;
			const request = pool.request();

			// Validando dados
			const problem = new Problem(req.body.title, req.body.description);

			if(!cityValidation(req.body.city)) {
				throw 'Cidade invalida.';
			}

			// Cadastro das imagens
			const imagesName = [];
			let imageContainer = process.env.IMAGES_STORAGE_CONTAINER;
			let imageUrl = process.env.STORAGE_URL;

			if (req.files.length != 0) {
				let imageName = '';

				req.files.forEach((image) => {
					imageName = getBlobName(image.originalname);

					const stream = getStream(image.buffer);
					const streamLength = image.buffer.length;

					blobService.createBlockBlobFromStream(imageContainer, imageName, stream, streamLength, err => {
						if (err) {
							handleError(err);
							return;
						}
					});

					imagesName.push(imageName);
				});
			}

			// Cadastro das informações
			request.input('title', sql.VarChar, problem.title);
			request.input('description', sql.VarChar, problem.description);
			request.input('city', sql.VarChar, req.body.city);

			const query = await request.query`INSERT INTO SolvedProblems (Title, Description, City) 
				VALUES (@title, @description, @city)`;
			
			// Pegando ID do problema inserido
			let problemId = await request.query`SELECT TOP 1 ID FROM SolvedProblems ORDER BY ID DESC`;
			problemId = problemId.recordset[0].ID;

			// Cadastro das imagens no servidor SQL
			if (imagesName.length != 0) {
				var newImagesName = imagesName.map((name, index) => {
					let newImageName = `${imageUrl}/${imageContainer}/${name}`;

					request.input(`nameInput${index}`, sql.VarChar, newImageName);
					request.query('INSERT INTO ProblemImages (name, problemId) VALUES (@nameInput' + index + ', ' + problemId + ')');
					// OBS.: Não utilize Template Strings neste caso pois gera um erro no SQL

					return newImageName;
				});
			}

			res.sendStatus(201);
		} catch (err) {
			errorHandling(err, res);
		} 
	}
}

module.exports = SolvedProblemController;