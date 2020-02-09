const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");

const collection = "categories";

function createCategories(req, res) {
  const { name, description } = req.body;
  if (name && description) {
    let fun = dataBase =>
      dataBase
        .collection(collection)
        .updateOne(
          { name },
          { $set: { description } },
          { upsert: true },
          (err, item) => {
            if (err) throw err;
            if (item.upsertedCount > 0) {
              res.status(201).send({
                status: true,
                data: { name, description },
                message: "Usuario creado con éxito"
              });
            } else {
              res.status(404).send({
                status: false,
                data: [],
                message: "Esta categoria ya se encuentra registrado"
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
      message: "No se han ingresado todos los campos nombre y descripción."
    });
  }
}

function retrieveCategory(req, res) {
  const { name } = req.params;
  if (name) {
    let fun = dataBase =>
      dataBase.collection(collection).findOne({ name }, (err, item) => {
        if (err) throw err;
        if (item) {
          res.status(200).send({
            status: true,
            data: item,
            message: `Categoria encontrada`
          });
        } else {
          res.status(400).send({
            status: false,
            data: [],
            message: `No se encuentra la categoria ${name}`
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
      message: "Se necesita el nombre de la categoria"
    });
  }
}

function retrieveCategories(req, res) {
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
            message: "Categorias devueltas con exito"
          });
        } else {
          res.status(400).send({
            status: false,
            data: [],
            message: "No se encontraron categorias"
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

module.exports = { createCategories, retrieveCategory, retrieveCategories };
