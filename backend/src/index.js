require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const boardsRoutes = require('./routes/boards');
app.use('/boards', boardsRoutes);

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };