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

  // PUT /:id - Update an existing expense by ID
  router.put('/:id', async (req, res) => {
    const { id } = req.params;

    const { amount, currency, description, date, city, latitude, longitude, notes, source, userId, categoryId } = req.body;

    try {
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id },
      });

      if (!existingExpense) {
        return res.status(404).json({ error: 'Expense not found.' });
      }

      const updateData = {};
      if (amount !== undefined) updateData.amount = amount;
      if (currency !== undefined) updateData.currency = currency;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date);
      if (city !== undefined) updateData.city = city;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (notes !== undefined) updateData.notes = notes;
      if (source !== undefined) updateData.source = source;
      if (userId !== undefined) updateData.user = { connect: { id: userId } }; // User relation
      if (categoryId !== undefined) updateData.category = { connect: { id: categoryId } }; // Category relation

      const updatedExpense = await prisma.expense.update({
        where: { id: id },
        data: updateData,
        include: {
          user: true,
          category: true,
        },
      });

      res.status(200).json(updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);

      res.status(500).json({ error: 'Failed to update expense. Check input data or IDs.' });
    }
  });

  // DELETE /:id - Delete an expense by ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id },
      });

      if (!existingExpense) {
        return res.status(404).json({ error: 'Expense not found.' });
      }

      await prisma.expense.delete({
        where: { id: id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting expense:', error);

      res.status(500).json({ error: 'Failed to delete expense.' });
    }
  });
  return router;
}
