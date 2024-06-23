const Router = require('express');
const router = new Router();
const adminController = require('../controllers/adminController');
const checkRole = require('../middleware/checkRoleMiddleware');

router.get('/stats', checkRole('ADMIN'), adminController.getStats);

module.exports = router;
