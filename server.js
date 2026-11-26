require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Employee Management API is running.' });
});
app.use('/api/employees', employeeRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Employee Management API listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Unable to start the API:', error.message);
    process.exitCode = 1;
  }
}

startServer();
