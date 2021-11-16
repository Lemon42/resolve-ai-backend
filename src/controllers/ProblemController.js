const sql = require('mssql');
const azureStorage = require('azure-storage');
const getStream = require('into-stream');
const getBlobName = require('../utils/getBlobName');

const Problem = require('../models/ProblemModel');

const errorHandling = require('../utils/errorHandling');;
const locationValidation = require('../utils/locationValidation');
const cityValidation = require('../utils/cityValidation');

const blobService = azureStorage.createBlobService();

class ProblemController {
	async create(req, res) {
		try {
			const problem = new Problem(req.body.title, req.body.description);

			// Descobrindo a cidade onde está localizado o problema
			let city = '';
			if (req.body.latitude && req.body.longitude) {
				console.log('okay')
				city = await locationValidation(req.body.latitude, req.body.longitude);
				if (city == false) {
					res.json({ error: 'Não estamos nessa cidade' });
					return;
				}
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

			// Envio para o servidor das informações
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('title', sql.VarChar, problem.title);
			request.input('description', sql.VarChar, problem.description);
			request.input('city', sql.VarChar, city);
			request.input('lat', sql.VarChar, req.body.latitude);
			request.input('lon', sql.VarChar, req.body.longitude);

			const query = await request.query`INSERT INTO Problems (Title, Description, City, Latitude, Longitude) 
				VALUES (@title, @description, @city, @lat, @lon)`;

			// Pegando ID do problema inserido
			let problemId = await request.query`SELECT TOP 1 ID FROM Problems ORDER BY ID DESC`;
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

			// Registro de problema na conta do usuário
			request.input('email', sql.VarChar, req.headers.email);
			request.query`INSERT INTO ProblemUser (Account, ProblemID) VALUES (@email, ${problemId})`;

			// Mandando o registro de volta para o front-end
			const responseData = await request.query(`SELECT * FROM Problems WHERE ID = ${problemId}`);

			res.status(201).json({ data: responseData.recordset[0], images: newImagesName });
		} catch (err) {
			errorHandling(err, res);
		}
	}

	async list(req, res) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();
		const dataResponse = await request.query(`SELECT * FROM Problems`);

		var data = dataResponse.recordset;

		// Pegando as imagens de cada problema
		const imagesPromise = data.map((problem) => {
			let newRequest = request.query(`SELECT Name FROM ProblemImages WHERE ProblemID = ${problem.ID}`);
			return newRequest;
		});
		const images = await Promise.all(imagesPromise);

		let response = images.map((image, index) => {
			let responseImage = image.recordset.map((object) => {
				if (object.Name) {
					return object.Name
				}
			});

			return { data: data[index], images: responseImage }
		});

		// Verificando se o usuario deu seu voto de relevancia
		const relevancePromise = response.map(async (problem) => {
			const relevance =  await this.getUserRelevance(problem.data.ID, req.headers.email);
			return { ...problem, isUp: relevance.isUp };
		});
		response = await Promise.all(relevancePromise);

		res.json(response);
	}

	async listInCity(req, res) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		request.input('city', sql.VarChar, req.params.city);
		const dataResponse = await request.query(`SELECT * FROM Problems WHERE city = @city`);

		var data = dataResponse.recordset;

		// Pegando as imagens de cada problema
		const imagesPromise = data.map((problem) => {
			let newRequest = request.query(`SELECT Name FROM ProblemImages WHERE ProblemID = ${problem.ID}`);
			return newRequest;
		});
		let images = await Promise.all(imagesPromise);

		const response = images.map((image, index) => {
			let responseImage = image.recordset.map((object) => {
				if (object.Name) {
					return object.Name;
				}
			});

			return { data: data[index], images: responseImage }
		});

		res.json(response);
	}

	async search(req, res) {
		try {
			const params = req.params;

			// Verificando informações de envio
			if (params.user != 'true' && params.user != 'false') {
				throw 'Não foi possivel compreender o campo de usuario.';
			} else if (!cityValidation(params.city) && params.city != 'false') {
				throw 'Não estamos nessa cidade.';
			}

			// Criando query de forma dinamica
			let query = 'SELECT * FROM Problems ';
			let queryParams = [];

			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('title', sql.VarChar, '%' + params.title + '%');
			request.input('city', sql.VarChar, params.city);

			if (params.title != 'none') {
				queryParams.push('Title LIKE @title ');
			}
			if (params.city != 'false') {
				queryParams.push('City = @city ');
			}

			queryParams.forEach((item, index) => {
				if (index == 0) {
					query += `WHERE ${item} `;
				} else {
					query += `AND + ${item} `;
				}
			});

			var data = await request.query(query);

			// Verificando se quer apenas do usuario
			if (params.user == 'true') {
				const responseId = await request.query`SELECT ProblemID FROM ProblemImages`;
				const userProblems = responseId.recordsets[0].map(item => item.ProblemID);

				let newData = [];

				for (let item of data.recordsets[0]) {
					let isValid = false;

					userProblems.forEach((id) => {
						if (item.ID == id) {
							isValid = true;
						}
					})

					if (isValid) {
						newData.push(item);
					}
				}

				data = newData;
			} else {
				data = data.recordsets[0];
			}

			// Pegando as imagens de cada problema
			const imagesPromise = data.map((problem) => {
				let newRequest = request.query(`SELECT Name FROM ProblemImages WHERE ProblemID = ${problem.ID}`);
				return newRequest;
			});
			const images = await Promise.all(imagesPromise);

			let response = images.map((image, index) => {
				let responseImage = image.recordset.map((object) => {
					if (object.Name) {
						return object.Name;
					}
				});

				return { data: data[index], images: responseImage }
			});

			// Verificando se o usuario deu seu voto de relevancia
			const relevancePromise = response.map(async (problem) => {
				const relevance =  await this.getUserRelevance(problem.data.ID, req.headers.email);
				return { ...problem, isUp: relevance.isUp };
			});
			response = await Promise.all(relevancePromise);

			res.json(response);
		} catch (err) {
			errorHandling(err, res);
		}
	}

	async relevance(req, res) {
		try {
			let isUp;
			if (req.params.isUp == 'true') {
				isUp = true;
			} else if (req.params.isUp == 'false') {
				isUp = false;
			}
			else {
				throw 'Não foi possivel ler os parametros.';
			}

			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();
			request.input('problemId', sql.VarChar, req.params.problemId);
			request.input('email', sql.VarChar, req.headers.email);

			// Verificar se o problema realmente existe
			const problem = await request.query`SELECT ID FROM Problems WHERE id = @problemId`;
			if (problem.rowsAffected != 1) {
				throw 'Não foi possivel localizar o problema.';
			}

			// Cadastrando
			const relevance = await request.query
				`SELECT * FROM UsersRelevance WHERE ProblemId = @problemId AND UserEmail = @email`;

			if (relevance.rowsAffected == 0) { // Caso não tiver nada cadastrado
				request.query
					`INSERT INTO UsersRelevance (UserEmail,	ProblemId, IsUp) VALUES (@email, @problemId, ${isUp ? 1 : 0})`;

			} else if (relevance.recordset[0].IsUp != isUp) { // Caso queria trocar entre Up ou Down
				request.query
					`UPDATE UsersRelevance SET IsUp = ${isUp ? 1 : 0} WHERE ID = ${relevance.recordset[0].ID}`;

			} else { // Caso tenha apertado pela 2° vez no mesmo botão de relevancia
				request.query
					`DELETE FROM UsersRelevance WHERE ID = ${relevance.recordset[0].ID}`;
			}

			res.sendStatus(200);
		} catch (err) {
			errorHandling(err, res);
		}
	}

	async getUserRelevance(ProblemId, email) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		const response = await request.query
			`SELECT IsUp FROM UsersRelevance WHERE ProblemId = ${ProblemId} AND UserEmail = ${email}`;

		if (response.rowsAffected[0] == 0) {
			return { isUp: null }
		}
		else {
			return { isUp: response.recordset[0].IsUp }
		}
	}
}

module.exports = ProblemController;