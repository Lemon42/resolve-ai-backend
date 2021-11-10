const sql = require('mssql');

const Comment = require('../models/CommentModel');
const errorHandling = require('../utils/errorHandling');

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
				response = await request.query(`INSERT INTO Comments VALUES (@content, '` + date.recordset[0].date + `', @email, @problemId, 0)`);
			} else {
				throw 'O problema não existe.';
			}

			let id = await request.query`SELECT TOP 1 ID FROM Comments ORDER BY ID DESC`;
			id = id.recordset[0].ID;

			res.json({ id: id}).status(201);
		} catch (err) {
			errorHandling(err, res);
		}
	}

	async listComments(req, res) {
		const pool = await sql.connect(require('../config/databaseConfig'));
		const request = pool.request();

		request.input('id', sql.Int, req.params.id);
		let comments = await request.query`SELECT ID, Content, UserEmail, CreateDate FROM Comments WHERE ProblemID = @id`;
		comments = comments.recordset;

		// Encontrando nome e foto dos comentarios
		const data = comments.map(async (comment) => {
			let newUser = await request.query(`SELECT Name, Email, Picture FROM Users WHERE Email = '` + comment.UserEmail + `'`);
			return {
				id: comment.ID,
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

	async deleteComment(req, res) {
		try {
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('email', sql.VarChar, req.headers.email);
			request.input('problemId', sql.Int, req.params.problemId);
			request.input('commentId', sql.Int, req.params.commentId);

			const comment = await request.query
				`DELETE FROM Comments WHERE ID = @commentId AND UserEmail = @email AND ProblemID = @problemId`;

			if (comment.rowsAffected != 1) {
				throw 'Comentário não encontrado!';
			}

			res.sendStatus(200);
		} catch (err) {
			errorHandling(err, res);
		}
	}

	async reportComment(req, res) {
		try {
			const pool = await sql.connect(require('../config/databaseConfig'));
			const request = pool.request();

			request.input('email', sql.VarChar, req.headers.email);
			request.input('problemId', sql.Int, req.params.problemId);
			request.input('commentId', sql.Int, req.params.commentId);

			let reports = await request.query`SELECT Reports FROM Comments WHERE ID = @commentId`;
			reports = reports.recordset[0].Reports + 1;

			const comment = await request.query
				`UPDATE Comments SET Reports = ${reports} WHERE ID = @commentId AND ProblemID = @problemId`;

			if (comment.rowsAffected != 1) {
				throw 'Comentário não encontrado!';
			}

			res.sendStatus(200);
		} catch (err) {
			errorHandling(err, res);
		}
	}
}

module.exports = CommentController;