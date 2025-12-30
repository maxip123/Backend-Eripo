const client = require('../config/db');
const { ObjectId } = require('mongodb');

const db = client.db('eripo');
const ejerciciosCollection = db.collection('ejercicios');

const getEjercicios = async (req, res) => {
  try {
    const ejercicios = await ejerciciosCollection.find({}).toArray();
    res.json(ejercicios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ejercicios' });
  }
};

const createEjercicio = async (req, res) => {
  const { nombre, musculo, videoUrl, repeticiones, descanso } = req.body;
  try {
    const result = await ejerciciosCollection.insertOne({
      nombre,
      musculo,
      videoUrl,
      repeticiones,
      descanso
    });
    res.status(201).json({ _id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el ejercicio' });
  }
};

const updateEjercicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, musculo, videoUrl, repeticiones, descanso } = req.body;
  try {
    const result = await ejerciciosCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          nombre,
          musculo,
          videoUrl,
          repeticiones,
          descanso
        }
      }
    );
    res.json({ message: 'Ejercicio actualizado', modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
};

const deleteEjercicio = async (req, res) => {
  const { id } = req.params;
  try {
    await ejerciciosCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ejercicio' });
  }
};

module.exports = {
  getEjercicios,
  createEjercicio,
  updateEjercicio,
  deleteEjercicio
};