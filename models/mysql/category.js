const Sequelize = require('sequelize');

class Review extends Sequelize.Model {
  static initiate(sequelize) {
    Review.init(
      {
        title: {
          type: Sequelize.STRING(80),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        hits: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Review',
        tableName: 'reviews',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Review.belongsTo(db.User, {
      foreignKey: 'writer',
      targetKey: 'id',
    });
    db.Review.hasMany(db.ReviewComment, {
      foreignKey: 'review_id',
      sourceKey: 'id',
    });
  }
}

class Consult extends Sequelize.Model {
  static initiate(sequelize) {
    Consult.init(
      {
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        hits: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Consult',
        tableName: 'consults',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Consult.belongsTo(db.User, {
      foreignKey: 'writer',
      targetKey: 'id',
    });
    db.Consult.hasMany(db.ConsultComment, {
      foreignKey: 'consult_id',
      sourceKey: 'id',
    });
  }
}

class QnA extends Sequelize.Model {
  static initiate(sequelize) {
    QnA.init(
      {
        title: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        hits: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'QnA',
        tableName: 'qnas',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.QnA.belongsTo(db.User, {
      foreignKey: 'writer',
      targetKey: 'id',
    });
    db.QnA.hasMany(db.QnAComment, {
      foreignKey: 'qna_id',
      sourceKey: 'id',
    });
  }
}

module.exports = { Review, Consult, QnA };
