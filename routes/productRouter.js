const Router = require('express');
const router = new Router();
const productController = require('../controllers/productController');

router.get('/search', productController.search);

// другие маршруты...

module.exports = router;
