const express   = require('express');
const cors      = require('cors');
const dotenv    = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Only register and login routes for now
app.use('/api/auth', require('./routes/auth.routes'));




app.get('/', (req, res) =>
  res.json({ message: 'MockMate Pro API ✅' })
);




app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5800;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);