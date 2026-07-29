require('dotenv').config();
const { createServer } = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/db');
const initSocket = require('./src/socket/socketHandler');
<<<<<<< HEAD
=======
const { startDeadlineReminderJob } = require('./src/jobs/deadlineReminderJob');
>>>>>>> milestone2-import

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
const io = initSocket(httpServer);
app.set('io', io);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
<<<<<<< HEAD
  });
});
=======
    // Milestone 2: bắt đầu quét & gửi nhắc deadline tự động cho bài tập sắp đến hạn.
    startDeadlineReminderJob(io);
  });
});
>>>>>>> milestone2-import
