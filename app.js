const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// Слушаем 3000 порт
const { PORT = 3000 } = process.env;
const app = express();
const { login, createUser } = require('./controllers/users')
const auth = require('./middlewares/auth')
const { celebrate, Joi } = require('celebrate')
const { errors } = require('celebrate')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
  })
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  })
}), createUser);
app.use(auth);
app.use('/', require('./routes/users'));
app.use('/', require('./routes/cards'))
app.use('/', require('./routes/notFound'))
app.use(errors())

app.use((err, req, res, next) => {
  if(!err.statusCode) {
    const { statusCode = 500, message } = err
    return res.status(statusCode).send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message
    });
  }
  return res.status(err.statusCode).send({ message: err.message });
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})