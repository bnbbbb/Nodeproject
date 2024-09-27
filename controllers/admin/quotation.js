const Quotation = require('../../models/mysql/quotation');
const User = require('../../models/mysql/user');
const handleError = require('../../utils/utils');
const { sequelize } = require('../../models/mysql');

exports.createQuotation = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { foundationId } = req.params;
    const {
      recipientName,
      EstimatedDate,
      paymentTerms,
      deliveryTerms,
      validityPeriod,
      tax,
      registNumber,
      companyName,
      ceoName,
      business,
      event,
      companyContact,
      items,
      total,
    } = req.body;

    // const quotation = await Quotation.create({
    //   recipientName,
    //   EstimatedDate,
    //   paymentTerms,
    //   deliveryTerms,
    //   validityPeriod,
    //   tax,
    //   registNumber,
    //   companyName,
    //   ceoName,
    //   business,
    //   event,
    //   companyContact,
    //   items,
    //   total,
    // });
    const itemsJson = JSON.stringify(items);
    const createQuery = ` insert into quotations (foundation_id, recipientName, 
    EstimatedDate, paymentTerms, deliveryTerms, validityPeriod,
     tax, registNumber, companyName, ceoName, business, event,
      companyContact, items, total, createdAt, updatedAt)
      values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const [quotations] = await sequelize.query(createQuery, {
      replacements: [
        foundationId,
        recipientName,
        EstimatedDate,
        paymentTerms,
        deliveryTerms,
        validityPeriod,
        tax,
        registNumber,
        companyName,
        ceoName,
        business,
        event,
        companyContact,
        itemsJson,
        total,
      ],
      type: sequelize.QueryTypes.INSERT,
    });

    const result = await sequelize.query(
      `select * from quotations where id= ?`,
      {
        replacements: [quotations],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    await transaction.commit();
    res.status(201).json({ code: 201, result });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

exports.editQuotation = async (req, res, next) => {
  //
  try {
    const { quotationId } = req.params;
    const updateData = req.body;
    // const userId = req.user.id;

    // ORM
    // const quotation = await Quotation.findByPk(quotationId);

    // const [updatedCount] = await Quotation.update(updateData, {
    //   where: { id: quotationId },
    //   paranoid: false,
    // });

    // Query
    const quotationQuery = `
            select id from quotations
            where id = ?
          `;
    const [quotation] = await sequelize.query(quotationQuery, {
      replacements: [quotationId],
      type: sequelize.QueryTypes.SELECT,
    });
    const updatableFields = [
      'recipientName',
      'EstimatedDate',
      'paymentTerms',
      'deliveryTerms',
      'validityPeriod',
      'tax',
      'registNumber',
      'companyName',
      'ceoName',
      'business',
      'event',
      'companyContact',
      'items',
      'total',
    ];

    const updateFields = [];
    const replacements = [];

    // 업데이트할 필드 수집
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        replacements.push(
          field === 'items' ? JSON.stringify(req.body[field]) : req.body[field]
        );
      }
    });

    if (updateFields.length > 0) {
      const updateQuery = `
        UPDATE quotations 
        SET ${updateFields.join(', ')}, updatedAt = NOW()
        WHERE id = ?;
      `;
      replacements.push(quotationId);

      const [updatedCount] = await sequelize.query(updateQuery, {
        replacements,
      });

      if (updatedCount === 0) {
        const error = new Error('견적서 수정 중 오류가 발생했습니다.');
        error.status = 404;
        throw error;
      }
    }
    const updatequotation = await Quotation.findByPk(quotationId);

    res.status(200).json({ code: 200, updatequotation });
  } catch (error) {
    next(error);
  }
};

exports.getQuotation = async (req, res, next) => {
  try {
    const { quotationId } = req.params;
    console.log(quotationId);

    const quotationQuery = `
            select * from quotations
            where id= ?
          `;
    const [quotation] = await sequelize.query(quotationQuery, {
      replacements: [quotationId],
      type: sequelize.QueryTypes.SELECT,
    });

    if (quotation.length < 1) {
      handleError(404, '견적서를 찾을 수 없습니다.');
    }

    res.status(200).json({ code: 200, quotation });
  } catch (error) {
    next(error);
  }
};
