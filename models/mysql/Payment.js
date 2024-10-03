const { Sequelize } = require('sequelize');

class Payment extends Sequelize.Model {
  static initiate(sequelize) {
    Payment.init(
      {
        amount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        paymentStatus: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        paymentId: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        merchant_uid: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        quotationId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cardName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        cardNum: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: 'Payment',
        tableName: 'payments',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  //   static associations(db) {
  //     db.Payment.belongsTo(db.Quotation, {
  //       foreignKey: 'quotationId',
  //       targetKey: 'id',
  //     });
  //   }
}

module.exports = Payment;
