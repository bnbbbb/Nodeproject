const bcrypt = require('bcrypt');
const User = require('../models/mysql/user');

const hashPassword = async (password) => await bcrypt.hash(password, 12);

module.exports = { hashPassword };
