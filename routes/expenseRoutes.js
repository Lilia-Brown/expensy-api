const express = require('express');

const router = express.Router();

module.exports = (prisma) => {

  // POST /expenses - Create a new expense
  router.post('/', async (req, res) => {
    const { amount, currency, description, date, city, latitude, longitude, notes, source, userId, categoryId } = req.body;

    try {
      if (!amount || !date || !city || !userId || !categoryId) {
        return res.status(400).json({ error: 'Missing required fields: amount, date, city, userId, categoryId' });
      }

      const expenseDate = new Date(date);

      const newExpense = await prisma.expense.create({
        data: {
          amount,
          currency,
          description,
          date: expenseDate,
          city,
          latitude,
          longitude,
          notes,
          source,
          // Connect to User and Category via their IDs
          user: { connect: { id: userId } },
          category: { connect: { id: categoryId } },
          // parsedReceiptData: req.body.parsedReceiptData // TODO: When using AI parsing
          // receiptImageUrl: req.body.receiptImageUrl // TODO: When using receipt images
          // rawReceiptText: req.body.rawReceiptText // TODO: When using OCR
        },
      });

      res.status(201).json(newExpense);
    } catch (error) {
      console.error('Error creating expense:', error);
      
      res.status(500).json({ error: 'Failed to create expense. Check if userId or categoryId exist.' });
    }
  })
  return router;
}
