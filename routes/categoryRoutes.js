const express = require('express');

const router = express.Router();

module.exports = (prisma) => {
  // POST /categories - Create a new category
  router.post('/', async (req, res) => {
    const { name, description, icon, color, isDefault } = req.body;

    try {
      if (!name) {
        return res.status(400).json({ error: 'Category name is required.' });
      }

      const existingCategory = await prisma.category.findUnique({
        where: { name: name },
      });
      if (existingCategory) {
        return res.status(409).json({ error: 'Category with this name already exists.' });
      }

      const newCategory = await prisma.category.create({
        data: {
          name,
          description,
          icon,
          color,
          isDefault,
        },
      });

      res.status(201).json(newCategory);
    } catch (error) {
      console.error('Error creating category:', error);

      res.status(500).json({ error: 'Failed to create category.' });
    }
  })

  return router;
}
