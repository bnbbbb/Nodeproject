const Sequelize = require('sequelize');

class Quotation extends Sequelize.Model {
  static initiate(sequelize) {
    Quotation.init({});
  }
}
