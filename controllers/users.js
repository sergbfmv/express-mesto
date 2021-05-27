const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ data: users }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }))
}

module.exports.getUser = (req, res) => {
  User.findById(req.params.id, (err, user) => {
    if (err.message && ~err.message.indexOf('Cast to ObjectId failed')) {
      res.status(404).send({ message: "Пользователь по указанному _id не найден" })
    }
    res.json(user)
  })
    .then(user => res.send({ data: user }))
    .catch(() => {
      res.status(500).send({ message: 'Произошла ошибка' })
  })
}

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некоректные данные пользователя' })
      } else {
        return res.status(500).send({ message: 'Произошла ошибка' })
      }
  })
}

module.exports.updateProfile = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { name: req.params.name, about: req.params.about})
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некоректные данные пользователя' })
      } else {
        return res.status(500).send({ message: 'Произошла ошибка' })
      }
  })
}

module.exports.updateAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.params.avatar })
    .then(user => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(400).send({ message: 'Переданы некоректные данные пользователя' })
      } else {
        return res.status(500).send({ message: 'Произошла ошибка' })
      }
  })
}