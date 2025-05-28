const express = require('express');

const router = express.Router();

module.exports = (prisma) => {
  // GET / - Get all budgets
  router.get('/', async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found. Please ensure you are logged in.' });
    }

    try {
      const budgets = await prisma.budget.findMany({
        where: { userId: userId },
        orderBy: {
          startDate: 'desc',
        },
      });
      res.status(200).json(budgets);
    } catch (error) {
      console.error('Error fetching budgets:', error);

      res.status(500).json({ error: 'Failed to fetch budgets.' });
    }
  });

  // GET /:id - Get a single budget by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId; // Get userId from the authenticated request

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      const budget = await prisma.budget.findUnique({
        where: { id: id, userId: userId },
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found or not authorized to view.' });
      }

      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching single budget:', error);

      res.status(500).json({ error: 'Failed to fetch budget.' });
    }
  });

  // GET /city/:cityName - Get a budget for a specific city by user
  router.get('/city/:cityName', async (req, res) => {
    const { cityName } = req.params;
    const userId = req.userId;

    try {
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
      }

      const budget = await prisma.budget.findUnique({
        where: {
          userId_city: {
            userId: userId,
            city: cityName,
          },
        },
      });

      if (!budget) {
        return res.status(404).json({ error: `Budget not found for city: ${cityName} and authenticated user.` });
      }

      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching budget by city:', error);

      res.status(500).json({ error: 'Failed to fetch budget by city.' });
    }
  });

  // POST /budgets - Create a new budget
  router.post('/', async (req, res) => {
    const { id, city, budgetAmount, currency, startDate, endDate } = req.body; 
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    try {
      if (!city || !budgetAmount || !currency || !startDate || !userId) {
        return res.status(400).json({ error: 'Missing required fields: city, budgetAmount, currency, startDate, userId' });
      }

      const sDate = new Date(startDate);
      const eDate = new Date(endDate);

      const newbudget = await prisma.budget.create({
        data: {
          id,
          city,
          budgetAmount: parseFloat(budgetAmount),
          currency,
          startDate: sDate,
          endDate: eDate,
          userId: userId,
        },
      });

      res.status(201).json(newbudget);
    } catch (error) {
      console.error('Error creating budget:', error);
      
      res.status(500).json({ error: 'Failed to create budget. Check if userId exist.' });
    }
  });

  // PUT /:id - Update an existing budget by ID
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: User ID not found.' });
    }

    const { city, budgetAmount, currency, startDate, endDate } = req.body;

    try {
      const existingBudget = await prisma.budget.findUnique({
        where: { id: id, userId: userId },
      });

      if (!existingBudget) {
        return res.status(404).json({ error: 'Budget not found or not authorized to update.' });
      }

      const updateData = {};
      if (city !== undefined) updateData.city = city;
      if (budgetAmount !== undefined) updateData.budgetAmount = parseFloat(budgetAmount);
      if (currency !== undefined) updateData.currency = currency;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);

      const updatedBudget = await prisma.budget.update({
        where: { id: id },
        data: updateData,
      });

      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error('Error updating budget:', error);

      res.status(500).json({ error: 'Failed to update budget. Check input data or IDs.' });
    }
  });

  // DELETE /:id - Delete an budget by ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(404).json({ error: 'Budget not found or not authorized to delete.' });
    }

    try {
      const existingBudget = await prisma.budget.findUnique({
        where: { id: id, userId: userId },
      });

      if (!existingBudget) {
        return res.status(404).json({ error: 'Budget not found.' });
      }

      await prisma.budget.delete({
        where: { id: id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting budget:', error);

      res.status(500).json({ error: 'Failed to delete budget.' });
    }
  });
  return router;
}
