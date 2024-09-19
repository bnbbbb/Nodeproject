const isAdmin = (req, res, next) => {
  console.log(req.user);

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
  }
  next();
};

module.exports = isAdmin;
