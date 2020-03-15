const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam,
  addScore,
  shiftAssign
} = require("./sockets");
const fetch = require("node-fetch");
const { generateRandomCode } = require("../helpers");

module.exports = class Connection {
  constructor() {
    this.socket;
    this.io;
  }

  /**
   * Initialize the socket instance in order to use it all over
   * life cycle
   */
  async initEvents() {
    let connection = this;
    let socket = connection.socket;
    let io = connection.io;

    socket.emit("main", { message: "Loiter socket" });
    socket.emit("connected", { id: generateRandomCode(10) });

    socket.on("joinRoom", async data => {
      let teamData = data.split("|");
      let socketData = {
        code: teamData[0],
        teamCode: teamData[1],
        team: teamData[2]
      };
      let res = await verifyCode(socketData.code);

      if (res) {
        let currentTeams = await retrieveCurrentTeams(data.split("|")[0]);
        let team = {};
        let isTeamAdded = currentTeams.teams.find(
          e => e.teamId === socketData.teamCode
        );

        if (isTeamAdded) {
          team.message = "El equipo ya se encuentra en la sala";
          io.emit("response", team);
        } else if (currentTeams.teams.length < 6) {
          team = await addTeam(
            socketData.code,
            socketData.teamCode,
            socketData.team
          );
          delete team.teams;
          team.team = socketData.teamCode;
          if (team.status) {
            team.message = "Equipo añadido";
          } else {
            team.message = "Error intenta de nuevo";
          }
          currentTeams.teams.push({
            teamId: socketData.teamCode,
            team: socketData.team,
            score: 0
          });
          io.emit("response", team);
          io.emit("getWebTeams", currentTeams);
        } else {
          team.message = "Ya hay mas de seis equipos en la sala";
          team.team = [];
          socket.emit("response", team);
        }
      } else {
        socket.emit("response", {
          message: "El código no es válido",
          stutus: false,
          team: []
        });
      }
    });

    socket.on("callTeams", async data => {
      retrieveCurrentTeams(data).then(result => {
        socket.emit("getTeams", { Items: result.teams });
        socket.broadcast.emit("getTeams", { Items: result.teams });
      });
    });

    socket.on("onDisconnectTeam", async data => {
      deleteATeam(data.split("|")[0], data.split("|")[1]).then(_ => {
        retrieveCurrentTeams(data.split("|")[0]).then(result => {
          socket.emit("onDisconnectTeamResponse", { Items: result.teams });
          socket.emit("getTeams", { Items: result.teams });
          socket.broadcast.emit("getTeams", { Items: result.teams });
        });
      });
    });

    socket.on("startGame", data => {
      socket.broadcast.emit("onStartGame", data);
    });

    socket.on("getQuestion", async data => {
      let basicData = data.roomInfo;
      let currentTeams = await retrieveCurrentTeams(basicData[0]);

      let teamCopy = [...currentTeams.teams];
      let nextTeam = teamCopy.find(e => e.teamId === basicData[3]);
      let answeredQuestions = [];

      let availableTeam = [];

      if (nextTeam) {
        for (let i = 0; i < teamCopy.length; i++) {
          if (!data.teams.find(teamCopy[i])) {
            availableTeam = teamCopy[i];
          }
        }
      }

      teamCopy.forEach(e => {
        Array.prototype.push.apply(answeredQuestions, e.questions);
      });

      if (availableTeam.length === 0) {
        availableTeam = teamCopy;
        availableTeam.shift();
      }

      answeredQuestions = [...new Set(answeredQuestions)];

      fetch("https://socket-udem.herokuapp.com/categories/retrieveConcepts")
        .then(res => res.json())
        .then(async result => {
          if (result.status) {
            let dummyQuestions = [];
            let findQuestion;
            let teamIndex = teamCopy.indexOf(nextTeam);

            if (basicData.length > 0) {
              dummyQuestions = [...result.data];
              dummyQuestions = dummyQuestions.map(e => e._id);

              dummyQuestions = dummyQuestions.filter(
                e => !answeredQuestions.includes(e)
              );

              if (teamIndex < teamCopy.length - 1 && teamIndex >= 0) {
                await shiftAssign(
                  nextTeam.length >= 0 ? nextTeam.teamId : teamCopy[0].teamId,
                  basicData[0],
                  dummyQuestions[0]
                );
              } else {
                await shiftAssign(
                  teamCopy[0].teamId,
                  basicData[0],
                  dummyQuestions[0]
                );
              }
              findQuestion = result.data.find(e => e._id === dummyQuestions[0]);
            }

            let bodySocket = {
              Items: {
                Items:
                  basicData.length > 0
                    ? findQuestion.categories
                    : result.data[0].categories
              },
              time: 60000,
              body: basicData.length > 0 ? findQuestion : result.data[0],
              idQuestion: findQuestion._id,
              currentTeam: nextTeam ? nextTeam.teamId : teamCopy[0].teamId,
              nextTeam: availableTeam[0].teamId,
              teams: availableTeam
            };

            console.log(availableTeam);

            socket.emit("sendQuestion", bodySocket);
            socket.broadcast.emit("sendQuestion", bodySocket);
          }
        });
    });

    socket.on("getScore", data => {
      let myData = data.split("|");
      addScore(myData[0], myData[1], parseInt(myData[2])).then(res => {
        socket.broadcast.emit("sendScore", res);
      });
    });

    socket.on("disconnect", async data => {
      console.log("desconectado");
    });
  }
};
