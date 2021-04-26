const routes = require('express').Router();

const multer = require('multer');
const uploadImage = multer(require('./config/multerImage'));

const UserController = require('./controllers/UserController');
const userController = new UserController();
const ProblemController = require('./controllers/ProblemController');
const problemController = new ProblemController();

routes.post('/create-user', uploadImage.single('picture'), (req, res) => userController.createUser(req, res));
routes.post('/login', (req, res) => userController.authenticationUser(req, res));
routes.post('/validate', (req, res) => userController.validate(req, res));
routes.delete('/logout', (req, res) => userController.logout(req, res));

routes.post('/create-problem', uploadImage.array('images[]', 5),
	(req, res) => problemController.createProblem(req, res));

module.exports = routes;