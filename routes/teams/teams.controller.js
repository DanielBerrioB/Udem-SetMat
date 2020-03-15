const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../../utils/helpers");

const nameCollection = "room";

function getTeam(req, res) {
  let { code, teamId } = req.params;
  if (teamId && code) {
    let fun = dataBase =>
      dataBase
        .collection(nameCollection)
        .findOne({ uniqueCode: code }, (err, item) => {
          if (err) throw err;
          if (item) {
            let team = item.teams.find(e => e.teamId === teamId);
            res.status(200).send({
              status: true,
              data: team,
              message: "Equipo encontrado"
            });
          } else {
            res.status(404).send({
              status: false,
              data: [],
              message: "No se encontro el equipo"
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
      message: "No se ingreso la consulta"
    });
  }
}

module.exports = { getTeam };
