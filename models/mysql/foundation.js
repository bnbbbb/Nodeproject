const Sequelize = require('sequelize');

class Foundation extends Sequelize.Model {
  static initiate(sequelize) {
    Foundation.init(
      {
        firstProcess: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        secondProcess: {
          type: Sequelize.JSON,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Foundation',
        tableName: 'foundations',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associate(db) {
    db.Foundation.belongsTo(db.User, { foreignKey: 'writer', targetKey: 'id' });
  }
}

module.exports = Foundation;
