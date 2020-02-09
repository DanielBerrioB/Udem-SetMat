const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");

const collection = "concepts";

function createConcept(req, res) {
  const { category, concept, definition, value } = req.body;
  if (category && concept && definition && value) {
    let fun = dataBase =>
      dataBase
        .collection(collection)
        .updateOne(
          { concept },
          { $set: { category, definition, value } },
          { upsert: true },
          (err, item) => {
            if (err) throw err;
            if (item.upsertedCount > 0) {
              res.status(201).send({
                status: true,
                data: { category, concept, definition, value },
                message: "Concepto creado con éxito"
              });
            } else {
              res.status(404).send({
                status: false,
                data: [],
                message: "Este concepto ya se encuentra registrado"
              });
            }
          }
        );
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      fun(dataBase);
    } else {
      client.connect(err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        fun(dataBase);
      });
    }
  } else {
    res.status(400).send({
      status: false,
      data: [],
      message: "No se han ingresado todos los campos"
    });
  }
}

function retrieveConcept(req, res) {
  const { concept } = req.params;
  if (concept) {
    let fun = dataBase =>
      dataBase.collection(collection).findOne({ concept }, (err, item) => {
        if (err) throw err;
        if (item) {
          res.status(200).send({
            status: true,
            data: item,
            message: `Concepto encontrado`
          });
        } else {
          res.status(400).send({
            status: false,
            data: [],
            message: `No se encuentra el concepto ${concept}`
          });
        }
      });
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      fun(dataBase);
    } else {
      client.connect(err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        fun(dataBase);
      });
    }
  } else {
    res.status(400).send({
      status: false,
      data: [],
      message: "No se han ingresado todos los campos"
    });
  }
}

function retrieveConcepts(req, res) {
  let fun = dataBase =>
    dataBase
      .collection(collection)
      .find()
      .toArray((err, items) => {
        if (err) throw err;
        if (items.length > 0) {
          res.status(200).send({
            status: true,
            data: items,
            message: "Conceptos"
          });
        } else {
          res.status(400).send({
            status: false,
            data: [],
            message: "No se encontró ningun concepto"
          });
        }
      });
  if (isThereAnyConnection(client)) {
    const dataBase = client.db(DBName);
    fun(dataBase);
  } else {
    client.connect(err => {
      if (err) throw err;
      const dataBase = client.db(DBName);
      fun(dataBase);
    });
  }
}

module.exports = { createConcept, retrieveConcept, retrieveConcepts };
