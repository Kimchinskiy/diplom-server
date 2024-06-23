const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
        }
        next();
    } catch (e) {
        console.error("Ошибка при проверке токена:", e.message);
        next(); // Продолжаем выполнение запроса даже при ошибке проверки токена
    }
};
