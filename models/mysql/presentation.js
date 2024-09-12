const Sequelize = require('sequelize');

class Presentation extends Sequelize.Model {
  static initiate(sequelize) {
    Presentation.init(
      {
        img: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Presentation',
        tableName: 'presentations',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associations(db) {
    db.Presentation.belongsTo(db.User, {
      foreignKey: 'writer',
      targetKey: 'id',
    });
  }
}

module.exports = Presentation;
