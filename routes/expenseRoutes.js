const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authMiddleware);

module.exports = (prisma) => {
  // GET / - Get all expenses for the authenticated user, with optional filters
  router.get('/', async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found. Please ensure you are logged in.' });
    }

    const { city, categoryId, startDate, endDate } = req.query;

    try {
      const whereClause = {
        userId: userId,
      };

      if (city) {
        whereClause.city = city;
      }
      if (categoryId) {
        whereClause.categoryId = categoryId;
      }

      if (startDate || endDate) {
        whereClause.date = {};
        if (startDate) {
          whereClause.date.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.date.lte = new Date(endDate);
        }
      }

      const expenses = await prisma.expense.findMany({
        where: whereClause,
        include: {
          category: true, // Keep this, useful for displaying category name
        },
        orderBy: {
          date: 'desc',
        }
      });
      res.status(200).json(expenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);

      res.status(500).json({ error: 'Failed to fetch expenses.' });
    }
  });

  // GET /:id - Get a single expense by ID (with ownership check)
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      const expense = await prisma.expense.findUnique({
        where: { id: id, userId: userId },
        include: {
          category: true,
        },
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found or not authorized to view.' });
      }

      res.status(200).json(expense);
    } catch (error) {
      console.error('Error fetching single expense:', error);

      res.status(500).json({ error: 'Failed to fetch expense.' });
    }
  });

  // POST / - Create a new expense for the authenticated user
  router.post('/', async (req, res) => {
    const {
      amount, currency, description, date, city,
      latitude, longitude, notes, source, categoryId,
    } = req.body;

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      if (!amount || !currency || !date || !city || !categoryId) {
        return res.status(400).json({ error: 'Missing required fields: amount, currency, date, city, categoryId.' });
      }

      const expenseDate = new Date(date);

      const newExpense = await prisma.expense.create({
        data: {
          amount: parseFloat(amount),
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

      res.status(500).json({ error: 'Failed to create expense.' });
    }
  });

  // PUT /:id - Update an existing expense by ID (with ownership check)
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const {
      amount, currency, description, date, city,
      latitude, longitude, notes, source, categoryId,
      parsedReceiptData, receiptImageUrl, rawReceiptText
    } = req.body;

    try {
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id, userId: userId },
      });

      if (!existingExpense) {
        return res.status(404).json({ error: 'Expense not found or not authorized to update.' });
      }

      const updateData = {};
      if (amount !== undefined) updateData.amount = parseFloat(amount);
      if (currency !== undefined) updateData.currency = currency;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = new Date(date);
      if (city !== undefined) updateData.city = city;
      if (latitude !== undefined) updateData.latitude = latitude;
      if (longitude !== undefined) updateData.longitude = longitude;
      if (notes !== undefined) updateData.notes = notes;
      if (source !== undefined) updateData.source = source;

      if (categoryId !== undefined) updateData.categoryId = categoryId;

      const updatedExpense = await prisma.expense.update({
        where: { id: id },
        data: updateData,
        include: {
          category: true,
        },
      });

      res.status(200).json(updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);

      res.status(500).json({ error: 'Failed to update expense. Check input data or IDs.' });
    }
  });

  // DELETE /:id - Delete an expense by ID (with ownership check)
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      const existingExpense = await prisma.expense.findUnique({
        where: { id: id, userId: userId},
      });

      if (!existingExpense) {
        return res.status(404).json({ error: 'Expense not found or not authorized to delete.' });
      }

      await prisma.expense.delete({
        where: { id: id, userId: userId },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting expense:', error);

      res.status(500).json({ error: 'Failed to delete expense.' });
    }
  });
  return router;
}
