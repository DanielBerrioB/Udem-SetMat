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
function addTeam(code, team) {
  let fun = async dataBase =>
    new Promise(async resolve =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code },
          { $push: { teams: { team, score: 0 } } },
          async (err, item) => {
            if (err) throw err;
            if (item.result.n > 0)
              resolve({
                status: true,
                teams: await retrieveCurrentTeams(code)
              });
            else resolve({ status: false, team: [] });
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
function deleteATeam(name) {
  console.log(name);
  let fun = dataBase =>
    new Promise(resolve =>
      dataBase
        .collection(roomCollection)
        .deleteOne(
          { $pull: { teams: { team: name } } },
          { multi: true },
          (err, item) => {
            if (err) throw err;
            if (item.result.n > 1) {
              resolve({
                status: true,
                message: `El equipo ${name} se ha retirado de la sala`,
                team: name
              });
            } else {
              resolve({
                status: false,
                message: `Error`,
                team: ""
              });
            }
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
