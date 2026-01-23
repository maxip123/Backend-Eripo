const { MongoClient } = require('mongodb');

const uri = process.env.DATABASE_URL;
let client;
let clientPromise;

if (!process.env.DATABASE_URL) {
  throw new Error('Por favor, agrega DATABASE_URL a tus variables de entorno');
}

async function getClient() {
  if (client) {
    return client;
  }

  // Si ya hay una promesa de conexión en curso, la esperamos
  if (!clientPromise) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  }
  
  await clientPromise;
  console.log("✅ Conexión establecida/reutilizada");
  return client;
}

// Exportamos la función para usarla en tus controladores
module.exports = { getClient };