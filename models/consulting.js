const Sequelize = require('sequelize');

class Consulting extends Sequelize.Model {
  static initiate(sequelize) {
    Consulting.init(
      {
        content: {
          type: Sequelize.JSON,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Consulting',
        tableName: 'consultings',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Consulting.belongsTo(db.User, { foreignKey: 'writer', targetKey: 'id' });
  }
}

module.exports = Consulting;
