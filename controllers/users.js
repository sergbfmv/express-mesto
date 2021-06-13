const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../errors/validation-error');
const CastError = require('../errors/cast-error');
const ForbiddenError = require('../errors/forbidden-error');
const MongoError = require('../errors/mongo-error');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user === null) {
        throw new CastError('Карточка с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      data: {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        const error = new MongoError('Такой email уже зарегистрирован');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id,
    { name: name.toString(), about: about.toString() }, { runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new CastError('Карточка с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else if (err.name === 'TypeError') {
        const error = new ForbiddenError('Нельзя редактировать чужого пользователя!');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { runValidators: true })
    .then((user) => {
      if (user === null) {
        throw new CastError('Карточка с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else if (err.name === 'TypeError') {
        const error = new ForbiddenError('Нельзя редактировать чужого пользователя!');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res.send({ token });
      next();
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден');
        next(error);
      } else if (err.name === 'TypeError') {
        const error = new ForbiddenError('Нельзя редактировать чужого пользователя!');
        next(error);
      } else {
        next(err);
      }
    });
};
