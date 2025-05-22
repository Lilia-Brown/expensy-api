const express = require('express');

const router = express.Router();

module.exports = (prisma) => {
  // GET / - Get all expenses
  router.get('/', async (req, res) => {
    try {
      const expenses = await prisma.expense.findMany({
        include: {
          user: true,
          category: true,
        },
      });
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);

      res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
  });

  // GET /:id - Get a single expense by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const expense = await prisma.expense.findUnique({
        where: { id: id },
        include: {
          user: true,
          category: true,
        },
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found.' });
      }

      res.status(200).json(expense);
    } catch (error) {
      console.error('Error fetching single expense:', error);

      res.status(500).json({ error: 'Failed to fetch expense.' });
    }
  });

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
  });
  return router;
}
