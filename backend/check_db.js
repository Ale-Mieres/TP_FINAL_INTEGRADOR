const mongoose = require('mongoose');
const Turno = require('./src/models/Turno');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  const turnos = await Turno.find().lean();
  console.log('Turnos count:', turnos.length);
  for (let t of turnos) {
    console.log(`Turno ${t._id}: cancha=${t.cancha} (type ${typeof t.cancha})`);
  }
  process.exit(0);
}

check().catch(console.error);
