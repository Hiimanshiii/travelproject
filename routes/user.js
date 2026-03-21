const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const User = require('../models/user');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const user = require('../models/user');
const userController = require('../controllers/users');


// Signup form
router.get('/signup', (req, res) => {
    res.render('users/signup');
});


// Handle signup
router.post('/signup',userController.signup);


// Login form
router.get('/login', (req, res) => {
    res.render('users/login');
});


// Handle login
router.post('/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
   userController.login
);


// Logout
router.get('/logout',userController.logout);


module.exports = router;