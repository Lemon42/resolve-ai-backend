const multer = require('multer');
const inMemoryStorage = multer.memoryStorage();

module.exports = {
	storage: inMemoryStorage,
	limits: {
		fileSize: 5 * 1024 * 1024
	},
	fileFilter: (req, file, cb) => {
		const allowedMimes = [
			'image/png',
			'image/jpeg'
		];

		if (allowedMimes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new Error("Tipo de arquivo inválido."));
		}
	}
}