const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.DATABASE_URL);

async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Conexión exitosa a MongoDB Atlas");
  } catch (err) {
    console.error("❌ Error al conectar:", err.message);
  }
}

connectDB();

module.exports = client;