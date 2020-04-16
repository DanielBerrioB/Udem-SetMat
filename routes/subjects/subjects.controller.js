const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");

const collection = "subjects";

/**
 * This function allows to create only a subject with its categories
 * (THIS IS A NEW FUNCTIONALITY)
 * @param {Request} req
 * @param {Response} res
 */
function createSubjects(req, res) {
  let { subject, categories } = req.body;

  if (subject && categories) {
    let fun = (dataBase) =>
      dataBase
        .collection(collection)
        .insertOne({ subject, categories }, (err, item) => {
          if (err) throw err;
          if (item.result.n > 0) {
            res.status(201).send({
              status: true,
              data: { subject, categories },
              message: `Necesitas ingresar todos los campos requeridos`,
            });
          } else {
            res.status(401).send({
              status: false,
              data: [],
              message: `No se pudo crear el concepto, por favor intenta de nuevo`,
            });
          }
        });
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      fun(dataBase);
    } else {
      client.connect((err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        fun(dataBase);
      });
    }
  } else {
    res.status(400).send({
      status: false,
      data: [],
      message: `Necesitas ingresar todos los campos requeridos`,
    });
  }
}

function getAllSubjects(req, res) {
  let fun = (dataBase) =>
    dataBase
      .collection(collection)
      .find()
      .toArray((err, item) => {
        if (err) throw err;
        if (item.length > 0) {
          res.status(200).send({
            status: true,
            data: item,
            message: `Tematicas disponibles`,
          });
        } else {
          res.status(404).send({
            status: false,
            data: [],
            message: `No hay tematicas`,
          });
        }
      });
  if (isThereAnyConnection(client)) {
    const dataBase = client.db(DBName);
    fun(dataBase);
  } else {
    client.connect((err) => {
      if (err) throw err;
      const dataBase = client.db(DBName);
      fun(dataBase);
    });
  }
}

module.exports = { createSubjects, getAllSubjects };
