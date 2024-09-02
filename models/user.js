const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        email: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
        },
        username: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        contact: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        companyName: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        business: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        region: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        startDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        isStore: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        storeCount: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        sales: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'User',
        tableName: 'users',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    //TODO User 외래키 설정
    db.User.hasMany(db.Review);
    db.User.hasMany(db.Consult);
    db.User.hasMany(db.QnA);
  }
}

module.exports = User;
