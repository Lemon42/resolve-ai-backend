const routes = require('express').Router();

const multer = require('multer');
const uploadImage = multer(require('./config/multerImage'));

const UserController = require('./api/User');
const userController = new UserController();
const ProblemController = require('./api/Problem');
const problemController = new ProblemController();
const CommentController = require('./api/Comment');
const commentController = new CommentController();
const SolvedProblemsController = require('./api/SolvedProblems');
const solvedProblemsController = new SolvedProblemsController();

const authenticate = require('./middlewares/authenticateUser');
const authenticateAdmin = require('./middlewares/authenticateAdmin');

routes.get('/test', (req, res) => res.json({ status: 'O serviço da API está ativo!' }));

// Usuário
routes.post('/create-user', uploadImage.single('picture'), userController.create);
routes.post('/login', userController.authentication);
routes.post('/validate', userController.validate);
routes.delete('/logout', userController.logout);
routes.get('/user-problems', authenticate, (req, res) => userController.getUserProblem(req, res));
routes.get('/user-info', authenticate, (req, res) => userController.userInfo(req, res));
routes.put('/profile-picture', authenticate, uploadImage.single('picture'), (req, res) => userController.editPhoto(req, res));

// Problemas
routes.post('/create-problem', authenticate, uploadImage.array('images[]', 5), problemController.create);
routes.get('/list-problems/', authenticate, (req, res) => problemController.list(req, res));
routes.get('/list-problems/:city', authenticate, (req, res) => problemController.listInCity(req, res));
routes.get('/search/:title/:city/:user', authenticate, (req, res) => problemController.search(req, res));
routes.post('/relevance/:problemId/:isUp', authenticate, (req, res) => problemController.relevance(req, res));

// Comentários
routes.post('/create-comment', authenticate, commentController.createComment);
routes.get('/comment/:id', authenticate, commentController.listComments);
routes.delete('/comment/:commentId/problem/:problemId', authenticate, commentController.deleteComment);
routes.post('/report-comment/:commentId/problem/:problemId', authenticate, commentController.reportComment);

// Problemas resolvidos
routes.post('/create-solved-problem', authenticateAdmin, uploadImage.array('images[]', 5), solvedProblemsController.create);

module.exports = routes;