const crypto = require("crypto");
const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");
const { createToken } = require("../../utils/auth");

const collection = "users";

/**
 * This function creates an user and store it into
 * the data base.
 * @param {Object} req
 * @param {Object} res
 */
function createUser(req, res) {
  const { name, email, password } = req.body;
  if (name && email && password) {
    let body = {
      name,
      password: crypto.createHmac("sha256", password).digest("hex")
    };

    let fun = dataBase =>
      dataBase
        .collection(collection)
        .updateOne({ email }, { $set: body }, { upsert: true }, (err, item) => {
          if (err) throw err;
          if (item.upsertedCount > 0) {
            delete body.password;
            body.email = email;
            res.status(201).send({
              status: true,
              data: body,
              message: "Usuario creado con éxito"
            });
          } else {
            res.status(404).send({
              status: false,
              data: [],
              message: "Este email ya se encuentra registrado"
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

/**
 * This function logs a user and creates its token
 * to enter into the app.
 * @param {Object} req
 * @param {Object} res
 */
function logIn(req, res) {
  const { email, password } = req.body;
  if (email && password) {
    let fun = dataBase =>
      dataBase.collection(collection).findOne(
        {
          $and: [
            {
              email,
              password: crypto.createHmac("sha256", password).digest("hex")
            }
          ]
        },
        (err, user) => {
          if (err) throw err;
          if (user) {
            const token = createToken({ ...user });
            delete user.password;
            delete user.email;
            delete user.name;
            res.status(200).send({
              status: true,
              data: user,
              message: "Usuario encontrado",
              token: token
            });
          } else {
            res.status(404).send({
              status: false,
              data: [],
              message:
                "El usuario no se encuentra registrado con estas credenciales"
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

module.exports = { logIn, createUser };
