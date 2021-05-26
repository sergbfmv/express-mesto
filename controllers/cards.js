const Card = require('../models/card')

module.exports.getCards = (req, res) => {
  Card.find({})
    .then(cards => res.send({ data: cards }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }))
}

module.exports.createCard = (req, res) => {
  console.log(req.user._id)
  const { name, link } = req.body
  Card.create({ name, link })
    .then(cards => res.send({ data: cards }))
    .catch(() => {
      if (err = 'ValidatorError') {
        return res.status(400).send({ message: 'Переданы некоректные данные карточки' })
      } else {
        return res.status(500).send({ message: 'Произошла ошибка' })
      }
  })
}

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId, (err, card) => {
    if (err.message && ~err.message.indexOf('Cast to ObjectId failed')) {
      res.status(404).send({ message: "Карточка по указанному _id не найдена" })
    }
    res.json(user)
  })
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }))
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }))
}

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .then(user => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }))
}