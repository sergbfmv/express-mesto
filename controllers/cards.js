const CastError = require('../errors/cast-error');
const ForbiddenError = require('../errors/forbidden-error');
const ValidationError = require('../errors/validation-error');
const Card = require('../models/card');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные карточки');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (card.owner === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .then((user) => res.send({ data: user }))
          .catch((err) => {
            if (err.name === 'CastError') {
              const error = new CastError('Карточка с указанным id не найдена');
              next(error);
            } else {
              next(err);
            }
          });
      }
      return Promise.reject(new Error('Нельзя удалять чужие карточки!'));
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        const error = new CastError('Карточка с указанным id не найдена');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((user) => {
      if (user === null) {
        throw new CastError('Карточка с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные карточки');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Карточка с указанным id не найдена');
        next(error);
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((user) => {
      if (user === null) {
        throw new CastError('Карточка с указанным id не найдена');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new ValidationError('Переданы некорректные данные карточки');
        next(error);
      } else if (err.name === 'CastError') {
        const error = new CastError('Карточка с указанным id не найдена');
        next(error);
      } else {
        next(err);
      }
    });
};
