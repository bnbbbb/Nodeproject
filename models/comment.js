const Sequelize = require('sequelize');

class ReviewComment extends Sequelize.Model {
  static initiate(sequelize) {
    ReviewComment.init(
      {
        comment: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'ReviewComment',
        tableName: 'review_comments',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.ReviewComment.belongsTo(db.Review, {
      foreignKey: 'review_id',
      targetKey: 'id',
    });
  }
}

class ConsultComment extends Sequelize.Model {
  static initiate(sequelize) {
    ConsultComment.init(
      {
        comment: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'ConsultComment',
        tableName: 'consult_comments',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.ConsultComment.belongsTo(db.Consult, {
      foreignKey: 'consult_id',
      targetKey: 'id',
    });
  }
}

class QnAComment extends Sequelize.Model {
  static initiate(sequelize) {
    QnAComment.init(
      {
        comment: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'QnAComment',
        tableName: 'qna_comments',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.QnAComment.belongsTo(db.QnA, {
      foreignKey: 'qna_id',
      targetKey: 'id',
    });
  }
}

module.exports = {
  ReviewComment,
  ConsultComment,
  QnAComment,
};
