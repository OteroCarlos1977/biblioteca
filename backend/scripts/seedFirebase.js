require('dotenv').config();

const { createBooks, createLibraryUsers, createLoans } = require('../src/database/librarySeed');
const firebaseDatabase = require('../src/database/firebaseConnection');

const admin = require('firebase-admin');

const batchWrite = async (collectionName, records) => {
  const db = admin.firestore();
  const collection = db.collection(process.env[`FIREBASE_${collectionName.toUpperCase()}_COLLECTION`] || collectionName);
  const chunkSize = 450;

  for (let index = 0; index < records.length; index += chunkSize) {
    const batch = db.batch();
    const chunk = records.slice(index, index + chunkSize);

    chunk.forEach(record => {
      batch.set(collection.doc(String(record.id)), record);
    });

    await batch.commit();
    console.log(`Cargados ${Math.min(index + chunk.length, records.length)} de ${records.length} registros en ${collectionName}`);
  }
};

const seedFirebase = async () => {
  // Forzamos una llamada al adaptador para inicializar Firebase Admin con las
  // credenciales configuradas en .env.
  await firebaseDatabase.findAllBooks();

  await batchWrite('books', createBooks());
  await batchWrite('users', createLibraryUsers());
  await batchWrite('loans', createLoans());

  console.log('Seed de Firebase finalizado.');
};

seedFirebase().catch(error => {
  console.error(error);
  process.exit(1);
});
