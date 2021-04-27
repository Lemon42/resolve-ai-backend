const sql = require('mssql');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
const getBlobName = require('../utils/getBlobName');

const Problem = require('../models/ProblemModel');

const blobService = azureStorage.createBlobService();

class ProblemController {
	async createProblem(req, res) {
		try {
			const problem = new Problem(req.body.title, req.body.description);

			// Cadastro das imagens
			const imagesName = [];

			if (req.files.length != 0) {
				let imageName = '';
				let imageContainer = '';

				req.files.forEach((image) => {
					imageName = getBlobName(image.originalname)
					imageContainer = process.env.IMAGES_STORAGE_CONTAINER;
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

			// Envio para o servidor das informações
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('title', sql.VarChar, problem.title);
			request.input('description', sql.VarChar, problem.description);
			request.query`INSERT INTO Problems (Title, Description) VALUES (@title, @description)`;

			// Pegando ID do problema inserido
			let lastId = await request.query`SELECT IDENT_CURRENT('Problems') as lastId`;
			lastId = lastId.recordset[0].lastId; 

			// Cadastro das imagens no servidor SQL
			if (imagesName.length != 0) {
				imagesName.forEach((name, index) => {
					request.input(`nameInput${index}`, sql.VarChar, name);
					request.query('INSERT INTO ProblemImages (name, imageId) VALUES (@nameInput' + index + ', ' + lastId + ')');
					// OBS.: Não utilize Template Strings neste caso pois gera um erro no SQL
				});
			}

			res.sendStatus(201);
		} catch (err) {
			console.error(err);
			res.json({ error: 'Preenchimento inválido de informações!', type: err });
			return;
		}
	}
}

module.exports = ProblemController;