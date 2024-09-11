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
        // 혹시 몰라서 로고도 넣었습니다.
        logo: {
          type: Sequelize.STRING,
          allowNull: true,
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
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
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
    db.User.hasMany(db.Review, {
      foreignKey: 'review_writer',
      sourceKey: 'id',
    });
    db.User.hasMany(db.Consult, {
      foreignKey: 'consult_writer',
      sourceKey: 'id',
    });
    db.User.hasMany(db.QnA, {
      foreignKey: 'qna_writer',
      sourceKey: 'id',
    });
    db.User.hasMany(db.Presentation, {
      foreignKey: 'writer',
      sourceKey: 'id',
    });
    db.User.hasMany(db.Foundation, {
      foreignKey: 'writer',
      sourceKey: 'id',
    });
    const commentModels = ['ReviewComment', 'ConsultComment', 'QnAComment'];

    commentModels.forEach((commentModelName) => {
      if (db[commentModelName]) {
        db.User.hasMany(db[commentModelName], {
          foreignKey: 'commenter',
          sourceKey: 'id',
          as: commentModelName.toLowerCase(), // Use lowercase for alias
        });
        db[commentModelName].belongsTo(db.User, {
          foreignKey: 'commenter',
          as: 'user',
        });
      }
    });
  }
}

module.exports = User;
