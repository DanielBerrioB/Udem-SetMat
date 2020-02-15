const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");

const collection = "categories";

/**
 * This function creates a new category.
 * The parameters are name and description.
 * The name will serve as a unique id
 * @param {Object} req
 * @param {Object} res
 */
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

/**
 * This function retrieve just one category given
 * its name by parameter.
 * @param {Object} req
 * @param {Object} res
 */
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

/**
 * This function retrieves all the categories registered
 * in the database.
 * @param {Object} req
 * @param {Object} res
 */
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
