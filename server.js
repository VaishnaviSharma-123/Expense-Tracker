const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000;

// 1. Middleware
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

// 2. MongoDB Connect 
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connection established!'))
  .catch(err => console.log('Error:', err));

// 3. SCHEMA + MODEL
const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "Other" },
  date: { type: Date, default: Date.now }
});

// Model = to talk with the collection in MongoDB
const Expense = mongoose.model('Expense', expenseSchema);

// 4. ROUTE creator
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// New expense creation route
app.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// shows all expenses
app.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

const apiRouter = express.Router();

apiRouter.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/expenses', async (req, res) => {
  const expenses = await Expense.find();
  res.json(expenses);
});

apiRouter.delete('/expenses/:id', async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.use('/api', apiRouter);

app.put('/expenses/:id', async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(expense);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:3000`);
});