const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');


module.exports.signup = wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) return next(err);

            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/signup');
    }
})

 module.exports.login = (req, res) => {
        req.flash('success', 'Welcome back!');
        res.redirect('/listings');
    }

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash('success', 'You have been logged out!');
        res.redirect('/listings');
    });
}