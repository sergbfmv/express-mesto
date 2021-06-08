const router = require('express').Router();
const {getUsers, getUserInfo, getUser, updateProfile, updateAvatar} = require('../controllers/users')
const { celebrate, Joi } = require('celebrate')

router.get('/users', getUsers)

router.get('/users/me', getUserInfo)

router.get('/users/:userId', getUser)

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  })
}), updateProfile)

router.patch('/users/me/avatar',celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().min(2).max(30),
  })
}), updateAvatar)

module.exports = router