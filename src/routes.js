const routes = require('express').Router();

const multer = require('multer');
const uploadImage = multer(require('./config/multerImage'));

const UserController = require('./controllers/UserController');
const userController = new UserController();
const ProblemController = require('./controllers/ProblemController');
const problemController = new ProblemController();

const authenticate = require('./utils/authenticateRequest');

routes.post('/create-user', uploadImage.single('picture'), (req, res) => userController.create(req, res));
routes.post('/login', (req, res) => userController.authentication(req, res));
routes.post('/validate', (req, res) => userController.validate(req, res));
routes.delete('/logout', (req, res) => userController.logout(req, res));

routes.post('/create-problem', authenticate, uploadImage.array('images[]', 5),
	(req, res) => problemController.create(req, res));
routes.get('/list-problems/', authenticate, (req, res) => problemController.list(req, res));
routes.get('/list-problems/:city', authenticate, (req, res) => problemController.listInCity(req, res));

routes.post('/create-comment', authenticate, (req, res) => problemController.createComment(req, res));

module.exports = routes;