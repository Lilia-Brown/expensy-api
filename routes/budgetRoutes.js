const express = require('express');

const router = express.Router();

module.exports = (prisma) => {
  // GET / - Get all budgets
  router.get('/', async (req, res) => {
    try {
      const budgets = await prisma.budget.findMany({
        include: {
          user: true,
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

    try {
      const budget = await prisma.budget.findUnique({
        where: { id: id },
        include: {
          user: true,
        },
      });

      if (!budget) {
        return res.status(404).json({ error: 'Budget not found.' });
      }

      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching single budget:', error);

      res.status(500).json({ error: 'Failed to fetch budget.' });
    }
  });

  // GET /city/:cityName - Get a budget for a specific city by user
  router.get('/city/:cityName', async (req, res) => {
    const { cityName } = req.params; // Get the city name from the URL parameter
    const { userId } = req.query;     // Get the userId from the query parameter

    try {
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required as a query parameter (e.g., ?userId=...).' });
      }

      const budget = await prisma.budget.findUnique({
        where: {
          userId_city: {
            userId: userId,
            city: cityName,
          },
        },
        include: {
          user: true,
        },
      });

      if (!budget) {
        return res.status(404).json({ error: `Budget not found for city: ${cityName} and user ID: ${userId}.` });
      }

      res.status(200).json(budget);
    } catch (error) {
      console.error('Error fetching budget by city:', error);

      res.status(500).json({ error: 'Failed to fetch budget by city.' });
    }
  });

  // POST /budgets - Create a new budget
  router.post('/', async (req, res) => {
    const { id, city, budgetAmount, currency, startDate, endDate, userId } = req.body;

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
          budgetAmount,
          currency,
          startDate: sDate,
          endDate: eDate,
          // Connect to User via their ID
          user: { connect: { id: userId } },
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

    const { city, budgetAmount, currency, startDate, endDate, userId } = req.body;

    try {
      const existingBudget = await prisma.budget.findUnique({
        where: { id: id },
      });

      if (!existingBudget) {
        return res.status(404).json({ error: 'Budget not found.' });
      }

      const updateData = {};
      if (city !== undefined) updateData.city = city;
      if (budgetAmount !== undefined) updateData.budgetAmount = budgetAmount;
      if (currency !== undefined) updateData.currency = currency;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (userId !== undefined) updateData.user = { connect: { id: userId } }; // User relation

      const updatedBudget = await prisma.budget.update({
        where: { id: id },
        data: updateData,
        include: {
          user: true,
        },
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

    try {
      const existingBudget = await prisma.budget.findUnique({
        where: { id: id },
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
