// server/controllers/productController.js

const { Product } = require('../models/models');

class ProductController {
    async search(req, res) {
        const { query } = req.query;
        try {
            const products = await Product.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${query}%`
                    }
                }
            });
            return res.json(products);
        } catch (e) {
            return res.status(500).json({ message: 'Ошибка поиска' });
        }
    }
}

module.exports = new ProductController();
