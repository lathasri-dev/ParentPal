const express = require('express');
const dotenv = require('dotenv');

// Load env vars immediately
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const connectPinecone = require('./config/pinecone');
const apiRoutes = require('./routes/api');

console.log("-----------------------------------------");
console.log("   PARENT PAL SERVER RESTARTING...       ");
console.log("-----------------------------------------");

// Connect to Database
connectDB();

// Initialize Pinecone
const pineconeClient = connectPinecone();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('ParentPal API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
