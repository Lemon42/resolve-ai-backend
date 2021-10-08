const sql = require('mssql');

const Comment = require('../models/CommentModel');

class CommentController {
	async createComment(req, res) {
		try {
			const comment = new Comment(req.body.content);

			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('content', sql.VarChar, comment.content);
			request.input('email', sql.VarChar, req.headers.email);
			request.input('problemId', sql.VarChar, req.body.problemId);

			// Validação de ID de problemas que
			let response = await request.query`SELECT ID FROM Problems WHERE ID = @problemId`;

			if (response.rowsAffected == 1) {
				let date = await request.query`SELECT FORMAT (getdate(), 'dd/MM/yy') as date`;
				response = await request.query(`INSERT INTO Comments VALUES (@content, '` + date.recordset[0].date + `', @email, @problemId)`);
			} else {
				throw 'O problema não existe.';
			}

			res.sendStatus(200);
		} catch (err) {
			console.error(err);
			res.json({ error: 'Preenchimento inválido de informações!', type: err });
			return;
		}
	}

	async listComments(req, res) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		request.input('id', sql.Int, req.params.id);
		let comments = await request.query`SELECT Content, UserEmail, CreateDate FROM Comments WHERE ProblemID = @id`;
		comments = comments.recordset;

		// Encontrando nome e foto dos comentarios
		const data = comments.map(async (comment) => {
			let newUser = await request.query(`SELECT Name, Email, Picture FROM Users WHERE Email = '` + comment.UserEmail + `'`);
			return {
				email: newUser.recordset[0].Email,
				name: newUser.recordset[0].Name,
				picture: newUser.recordset[0].Picture,
				content: comment.Content,
				date: comment.CreateDate
			};
		});
		const response = await Promise.all(data);

		res.json({ problemId: req.params.id, comments: response });
	}
}

module.exports = CommentController;