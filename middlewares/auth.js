const passport = require('passport');

exports.isLoggedIn = (req, res, next) => {
  console.log('Authenticated:', passport.authenticate());
  console.log('User:', req.passport);
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ code: 403, message: '로그인 필요합니다.' });
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.status(403).json({ code: 403, message: '로그인한 상태입니다.' });
  }
};
