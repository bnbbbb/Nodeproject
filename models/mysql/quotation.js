const Sequelize = require('sequelize');

class Quotation extends Sequelize.Model {
  static initiate(sequelize) {
    Quotation.init(
      {
        //고객
        recipientName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        EstimatedDate: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        paymentTerms: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        deliveryTerms: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        validityPeriod: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        tax: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        // 발행업체
        registNumber: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        companyName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        ceoName: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        business: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        // 종목
        event: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        companyContact: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        // 견적서 금액
        items: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        total: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Quotation',
        tableName: 'quotations',
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }
  static associations(db) {
    db.Quotation.belongsTo(db.Foundation, {
      foreignKey: 'foundation_id',
      targetKey: 'id',
    });
    // db.Quotation.hasMany(db.Payment, {
    //   foreignKey: 'quotationId',
    //   sourceKey: 'id',
    // });
  }
}

module.exports = Quotation;
