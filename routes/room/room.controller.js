const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");
const { generateRandomCode } = require("../../utils/helpers");

const collection = "room";

/**
 * This function creates a room with a unique code into
 * the database. This code will allow users to join in the room
 * @param {Object} req
 * @param {Object} res
 */
function createRoom(req, res) {
  let { category } = req.body;

  if (category) {
    let uniqueCode = generateRandomCode();

    let fun = dataBase =>
      dataBase
        .collection(collection)
        .insertOne({ uniqueCode, category, teams: [] }, (err, item) => {
          if (err) throw err;
          if (item.result.n > 0) {
            res.status(201).send({
              status: true,
              data: { uniqueCode, category, teams: [], availability: true },
              message: "Sala creada"
            });
          } else {
            res.status(404).send({
              status: false,
              data: [],
              message: "Error no se pudo generar la sala"
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
    console.log("Error");
    res.status(400).send({
      status: false,
      data: [],
      message: "No se han ingresado todos los campos"
    });
  }
}

/**
 * This funcion clears the DB
 * DANGER: JUST USE IN CASE OF DELETING ALL THE ELEMENTS
 */
function deleteAllRooms(req, res) {
  let fun = dataBase =>
    dataBase.collection(collection).deleteMany({}, (err, _) => {
      if (err) throw err;
      res.status(200).send({ message: "Data removed" });
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

module.exports = { createRoom, deleteAllRooms };
