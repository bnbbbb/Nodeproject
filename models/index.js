const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(
//     config.database,
//     config.username,
//     config.password,
//     config
//   );
// }
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
      // &&
      // file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    // const model = require(path.join(__dirname, file))(
    //   sequelize,
    //   Sequelize.DataTypes
    // );
    // db[model.name] = model;
    // console.log('file', file);
    // const model = require(path.join(__dirname, file));
    // console.log(model);
    // console.log(file, model.name);
    // db[model.name] = model;
    // model.initiate(sequelize);
    const model = require(path.join(__dirname, file));

    // 만약 model이 여러 모델을 포함하는 객체라면, 각각의 모델을 처리해야 합니다.
    if (typeof model === 'object' && !model.name) {
      Object.values(model).forEach((m) => {
        console.log('m', m);
        console.log(file, m.name); // 모델의 이름을 확인
        db[m.name] = m;
        m.initiate(sequelize);
      });
    } else {
      // 단일 모델일 경우
      console.log(file, model.name); // 모델의 이름을 확인
      db[model.name] = model;
      model.initiate(sequelize);
    }
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
