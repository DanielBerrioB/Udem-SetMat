const { DBName, client } = require("../../config/mongo.config");
const { isThereAnyConnection } = require("../helpers");

const roomCollection = "room";

/**
 * This function verifies if the code is valid or not
 * @param {String} code
 */
function verifyCode(code) {
  const fun = dataBase =>
    new Promise(resolve =>
      dataBase
        .collection(roomCollection)
        .find()
        .sort({ _id: -1 })
        .limit(1)
        .toArray((err, item) => {
          if (err) throw err;
          resolve(item);
        })
    );
  return new Promise(async resolve => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let item = await fun(dataBase);
      resolve(item[0].uniqueCode === code ? true : false);
    } else {
      return client.connect(async err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let item = await fun(dataBase);
        resolve(item[0].uniqueCode === code ? true : false);
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
  let fun = async dataBase =>
    new Promise(async resolve =>
      dataBase.collection(roomCollection).updateOne(
        { uniqueCode: code },
        {
          $push: { teams: { teamId: teamCode, team, score: 0 } }
        },
        async (err, item) => {
          if (err) throw err;
          if (item.result.n > 0) {
            let currentTeams = await retrieveCurrentTeams(code);
            currentTeams = currentTeams.teams.map(e => e.teamId);
            resolve({
              status: true,
              teams: currentTeams
            });
          } else resolve({ status: false, team: [] });
        }
      )
    );

  return new Promise(async resolve => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let item = await fun(dataBase);
      resolve(item);
    } else {
      client.connect(async err => {
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
  let fun = dataBase =>
    new Promise(resolve =>
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

  return new Promise(async resolve => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let teams = await fun(dataBase);
      resolve({ teams: teams.teams[0].teams });
    } else {
      client.connect(async err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let teams = await fun(dataBase);
        resolve({ teams: teams.teams[0].teams });
      });
    }
  });
}

/**
 * This function deletes a team given its name.
 * @param {String} name
 */
function deleteATeam(code, teamCode) {
  let fun = dataBase =>
    new Promise(resolve =>
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
              team: name
            });
          }
        )
    );

  return new Promise(async resolve => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let deleted = await fun(dataBase);
      resolve(deleted);
    } else {
      client.connect(async err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let deleted = await fun(dataBase);
        resolve(deleted);
      });
    }
  });
}

module.exports = { verifyCode, addTeam, retrieveCurrentTeams, deleteATeam };
