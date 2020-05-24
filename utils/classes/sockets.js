const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../helpers");

const roomCollection = "room";

/**
 * This function verifies if the code is valid or not
 * @param {String} code
 */
function verifyCode(code) {
  const fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .findOne({ uniqueCode: code }, (err, item) => {
          if (err) throw err;
          resolve(item);
        })
    );
  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let item = await fun(dataBase);
      resolve(item ? true : false);
    } else {
      return client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let item = await fun(dataBase);
        resolve(item ? true : false);
      });
    }
  });
}

/**
 * This function adds a new team, which
 * is a object.
 * @param {String} code
 * @param {Object} team
 */
function addTeam(code, teamCode, team) {
  let fun = async (dataBase) =>
    new Promise(async (resolve) =>
      dataBase.collection(roomCollection).updateOne(
        { uniqueCode: code },
        {
          $push: { teams: { teamId: teamCode, team, score: 0, questions: [] } },
        },
        async (err, item) => {
          if (err) throw err;
          if (item.result.n > 0) {
            let currentTeams = await retrieveCurrentTeams(code);
            currentTeams = currentTeams.teams.map((e) => e.teamId);
            resolve({
              status: true,
              teams: currentTeams,
            });
          } else resolve({ status: false, team: [] });
        }
      )
    );

  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let item = await fun(dataBase);
      resolve(item);
    } else {
      client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let item = await fun(dataBase);
        resolve(item);
      });
    }
  });
}

/**
 * This function gets all the teams and returns it
 * @param {String} uniqueCode
 */
function retrieveCurrentTeams(uniqueCode) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .find({ uniqueCode })
        .toArray((err, result) => {
          if (err) throw err;
          if (result.length > 0) {
            resolve({ teams: result });
          } else {
            resolve({ teams: [] });
          }
        })
    );

  return new Promise(async (resolve) => {
    if (uniqueCode) {
      if (isThereAnyConnection(client)) {
        const dataBase = client.db(DBName);
        let teams = await fun(dataBase);
        if (teams.teams[0]) {
          resolve({ teams: teams.teams[0].teams });
        } else {
          resolve({ teams: [] });
        }
      } else {
        client.connect(async (err) => {
          if (err) throw err;
          const dataBase = client.db(DBName);
          let teams = await fun(dataBase);
          if (teams) {
            resolve({ teams: teams.teams[0].teams });
          } else {
            resolve({ teams: [] });
          }
        });
      }
    } else {
      resolve({ teams: [] });
    }
  });
}

/**
 * This function deletes a team given its name.
 * @param {String} name
 */
function deleteATeam(code, teamCode) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .update(
          { uniqueCode: code },
          { $pull: { teams: { teamId: teamCode } } },
          { multi: true },
          (err, _) => {
            if (err) throw err;
            resolve({
              status: true,
              message: `El equipo se ha retirado de la sala`,
            });
          }
        )
    );

  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let deleted = await fun(dataBase);
      resolve(deleted);
    } else {
      client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let deleted = await fun(dataBase);
        resolve(deleted);
      });
    }
  });
}

/**
 * This function adds a new score to a Team
 * @param {String} team
 * @param {Int} score
 */
function addScore(code, teamCode, score) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code, "teams.teamId": teamCode },
          { $set: { "teams.$.score": score } },
          (err, item) => {
            if (err) throw err;
            if (item.result.n > 0) {
              resolve({
                status: true,
                message: `Puntaje añadido`,
                data: { code, teamCode, score },
              });
            } else {
              resolve({
                status: false,
                message: `Puntaje no añadido`,
                data: [],
              });
            }
          }
        )
    );

  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let added = await fun(dataBase);
      resolve(added);
    } else {
      client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let added = await fun(dataBase);
        resolve(added);
      });
    }
  });
}

/**
 * This function assigns the team in the game, and
 * saves a history of each team
 * @param {String} teamCode
 * @param {String} code
 * @param {String} idQuestion
 */
function shiftAssign(teamCode, code, idQuestion) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code, "teams.teamId": teamCode },
          { $push: { "teams.$.questions": idQuestion } },
          (err, item) => {
            if (err) throw err;
            if (item.result.n > 0) {
              resolve({
                status: true,
                message: `Pregunta asignada`,
                data: { code, teamCode },
              });
            } else {
              resolve({
                status: false,
                message: `Pregunta no asignada`,
                data: [],
              });
            }
          }
        )
    );

  return new Promise(async (resolve) => {
    if (idQuestion) {
      if (isThereAnyConnection(client)) {
        const dataBase = client.db(DBName);
        let added = await fun(dataBase);
        resolve(added);
      } else {
        client.connect(async (err) => {
          if (err) throw err;
          const dataBase = client.db(DBName);
          let added = await fun(dataBase);
          resolve(added);
        });
      }
    } else {
      resolve([]);
    }
  });
}

/**
 * This function changes the state of a room to unavailable
 * @param {String} code
 */
function changeRoomState(code) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code },
          { $set: { availability: false } },
          (err, item) => {
            if (err) throw err;
            if (item.result.n > 0) {
              resolve({
                status: true,
                message: `Sala cerrada`,
              });
            } else {
              resolve({
                status: false,
                message: `Error intenta de nuevo`,
              });
            }
          }
        )
    );

  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let added = await fun(dataBase);
      resolve(added);
    } else {
      client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let added = await fun(dataBase);
        resolve(added);
      });
    }
  });
}

/**
 * This function allows to know the max number of teams available
 * @param {String} code
 */
function getMaxTeams(code) {
  let fun = (dataBase) =>
    new Promise((resolve) =>
      dataBase
        .collection(roomCollection)
        .findOne({ uniqueCode: code }, (err, item) => {
          if (err) throw err;
          if (item) {
            resolve(item.numMax);
          } else {
            resolve(-1);
          }
        })
    );

  return new Promise(async (resolve) => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let added = await fun(dataBase);
      resolve(added);
    } else {
      client.connect(async (err) => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let added = await fun(dataBase);
        resolve(added);
      });
    }
  });
}

module.exports = {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam,
  addScore,
  shiftAssign,
  changeRoomState,
  getMaxTeams,
};
