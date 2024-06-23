const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const fileUpload = require('express-fileupload');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.get('/auth', authMiddleware, userController.check);
router.post('/avatar', authMiddleware, fileUpload(), userController.uploadAvatar);

module.exports = router;