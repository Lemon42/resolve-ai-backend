const routes = require('express').Router();

const multer = require('multer');
const uploadStrategy = multer(require('./config/multerImage')).single('picture');

const UserController = require('./controllers/UserController');
const userController = new UserController();

routes.post('/create-user', uploadStrategy, (req, res) => userController.createUser(req, res));
routes.post('/login', (req, res) => userController.authenticationUser(req, res));
routes.post('/validate', (req, res) => userController.validate(req, res));
routes.delete('/logout', (req, res) => userController.logout(req, res));

module.exports = routes;