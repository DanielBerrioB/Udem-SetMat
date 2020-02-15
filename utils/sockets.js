const { DBName, client } = require("../config/mongo.config");
const { isThereAnyConnection } = require("./helpers");

const roomCollection = "room";

/**
 * This function verifies if the code is valid or not
 * @param {String} code
 */
async function verifyCode(code) {
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
async function addTeam(code, team) {
  let fun = dataBase =>
    new Promise(resolve =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code },
          { $push: { teams: team } },
          (err, item) => {
            if (err) throw err;
            if (item.result.n > 0) resolve({ status: true, team });
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
      return client.connect(async err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let item = await fun(dataBase);
        resolve(item);
      });
    }
  });
}

module.exports = { verifyCode, addTeam };
