//server/controllers/userControllers
const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Basket } = require('../models/models');
const uuid = require('uuid');
const path = require('path');

const generateJwt = (id, email, role, firstName, lastName, phoneNumber) => {
    return jwt.sign(
        { id, email, role, firstName, lastName, phoneNumber },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class UserController {
    async registration(req, res, next) {
        const { email, password, role, firstName, lastName, phoneNumber } = req.body;
        if (!email || !password || !firstName || !lastName || !phoneNumber) {
            return next(ApiError.badRequest('Некорректные данные для регистрации'));
        }
        try {
            const candidate = await User.findOne({ where: { email } });
            if (candidate) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            const user = await User.create({ email, role, password: hashPassword, firstName, lastName, phoneNumber });
            await Basket.create({ userId: user.id });
            const token = generateJwt(user.id, user.email, user.role, user.firstName, user.lastName, user.phoneNumber);
            return res.json({ token });
        } catch (err) {
            return next(ApiError.internal('Ошибка при регистрации пользователя', err));
        }
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {
                return next(ApiError.internal('Указан неверный пароль'));
            }
            const token = generateJwt(user.id, user.email, user.role, user.firstName, user.lastName, user.phoneNumber);
            return res.json({ token });
        } catch (err) {
            return next(ApiError.internal('Ошибка при входе пользователя', err));
        }
    }

    async check(req, res, next) {
        try {
            const user = await User.findByPk(req.user.id, {
                attributes: ['id', 'email', 'role', 'firstName', 'lastName', 'phoneNumber']
            });
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
            const token = generateJwt(user.id, user.email, user.role, user.firstName, user.lastName, user.phoneNumber);
            return res.json({ token, user });
        } catch (err) {
            return next(ApiError.internal('Ошибка при проверке пользователя', err));
        }
    }

    async uploadAvatar(req, res, next) {
        try {
            if (!req.files || !req.files.file) {
                return next(ApiError.badRequest('Файл не был загружен'));
            }
    
            const { file } = req.files;
            const userId = req.user.id;
            const avatarName = uuid.v4() + path.extname(file.name);
    
            const avatarPath = path.resolve(__dirname, '..', 'static', 'uploads', 'avatars', avatarName);
            await file.mv(avatarPath);
    
            const user = await User.findByPk(userId);
            if (!user) {
                return next(ApiError.internal('Пользователь не найден'));
            }
    
            user.avatar = avatarName;
            await user.save();
    
            return res.json({ message: "Аватар успешно обновлен", avatar: avatarName });
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            return next(ApiError.internal('Ошибка при загрузке аватара'));
        }
    }
}    

module.exports = new UserController();
