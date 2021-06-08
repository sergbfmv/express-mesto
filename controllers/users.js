const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const ValidationError = require('../errors/validation-error')
const CastError = require('../errors/cast-error');
const ForbiddenError = require('../errors/forbidden-error');
const AuthError = require('../errors/auth-error');
const { Mongoose } = require('mongoose');
const MongoError = require('../errors/mongo-error');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(next)
}

module.exports.getUser = (req, res, next) => {
  User.findById(req._id)
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден')
        next(error)
      } else {
          next(err)
      }
  })
}

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        const error = new CastError('Пользователь с указанным id не найден')
        next(error)
      } else {
          next(err)
      }
  })
}

module.exports.createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then(hash => User.create({
      name: name,
      about: about,
      avatar: avatar,
      email: email,
      password: hash,
    }))
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя')
        next(error)
      } else if (err.name === "MongoError" && err.code === 11000) {
          const error = new MongoError('Такой email уже зарегистрирован')
          next(error)
      } else {
          next(err)
      }
  })
}

module.exports.updateProfile = (req, res, next) => {
  const { name, about } = req.body
  User.findByIdAndUpdate(req.user._id, { name: name.toString(), about: about.toString()}, {runValidators: true})
    .then(user => res.send({ data: user }))
    .catch((err) => {
      console.log(err.name)
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя')
        next(error)
      } else if (err.name === 'CastError') {
          const error = new CastError('Пользователь с указанным id не найден')
          next(error)
      } else {
          next(err)
      }
  })
    .catch((err) => {
      const error = new ForbiddenError('Нельзя редактировать чужого пользователя!')
      next(error)
    })
}

module.exports.updateAvatar = (req, res, next) => {
  const { avatar } = req.body
  User.findByIdAndUpdate(req.user._id, { avatar: avatar }, {runValidators: true})
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные пользователя')
        next(error)
      } else if (err.name === 'CastError') {
          const error = new CastError('Пользователь с указанным id не найден')
          next(error)
      } else {
          next(err)
      }
  })
    .catch((err) => {
      const error = new ForbiddenError('Нельзя редактировать чужого пользователя!')
      next(error)
  })
}

module.exports.login = (req, res, next) => {
  const { email, password } = req.body

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({_id: user._id}, 'super-strong-secret', {expiresIn: '7d'})
      res.send({token})
      next()
    })
    .catch((err) => {
        const error = new AuthError('Невозможно авторизоваться')
        next(error)
    })
    .catch(next)
}