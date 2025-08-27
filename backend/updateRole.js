const mongoose = require('mongoose');
const Worker = require('./models/Worker'); // adjust path as needed
require('dotenv').config();

async function addRoleToWorkers() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true
  });

  await Worker.updateMany(
    { role: { $exists: false } },
    { $set: { role: "employee" } }
  );
  
  console.log("All existing workers updated with default role.");
  await mongoose.disconnect();
}

addRoleToWorkers();
