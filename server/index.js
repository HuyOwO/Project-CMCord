require('dotenv').config();
const { createServer } = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/socket/socketHandler');

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = initSocket(httpServer);
app.set('io', io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});