const { DBName, client } = require("../config/mongo.config");
const { isThereAnyConnection } = require("./helpers");

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
  //console.log(team)
  let fun = async dataBase =>
    new Promise(async resolve =>
      dataBase
        .collection(roomCollection)
        .updateOne(
          { uniqueCode: code },
          { $push: { teams: team } },
          async (err, item) => {
            if (err) throw err;
            let currentTeams = await retrieveCurrentTeams(code)
            //console.log(currentTeams.teams)
            if (item.result.n > 0) resolve({ status: true, teams: currentTeams.teams[0].teams });
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


function retrieveCurrentTeams(uniqueCode) {
  let fun = dataBase => new Promise(resolve => dataBase.collection(roomCollection).find({ uniqueCode }).toArray((err, result) => {
    if (err) throw err
    if (result.length > 0) {
      resolve({ teams: result })
    }
  }))

  return new Promise(async resolve => {
    if (isThereAnyConnection(client)) {
      const dataBase = client.db(DBName);
      let teams = await fun(dataBase);
      resolve({teams: teams.teams[0].teams});
      console.log(teams.teams[0].teams)
    } else {
      return client.connect(async err => {
        if (err) throw err;
        const dataBase = client.db(DBName);
        let teams = await fun(dataBase);
        console.log(teams)
        resolve(teams);
      });
    }
  })
}

module.exports = { verifyCode, addTeam, retrieveCurrentTeams };
