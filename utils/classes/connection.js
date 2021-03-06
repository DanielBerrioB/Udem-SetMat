const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam,
  addScore,
  shiftAssign,
  changeRoomState,
  getMaxTeams,
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

    socket.on("joinRoom", async (data) => {
      let teamData = data.split("|");
      let socketData = {
        code: teamData[0],
        teamCode: teamData[1],
        team: teamData[2],
      };
      let res = await verifyCode(socketData.code);

      if (res) {
        let maxTeams = await getMaxTeams(data.split("|")[0]);
        let currentTeams = await retrieveCurrentTeams(data.split("|")[0]);

        if (currentTeams.teams.length < maxTeams && maxTeams !== -1) {
          let team = {};
          let isTeamAdded = currentTeams.teams.find(
            (e) => e.teamId === socketData.teamCode
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
              score: 0,
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
            message: "La sala ya ha excedido el número máximo de participantes",
            stutus: false,
            team: [],
          });
        }
      } else {
        socket.emit("response", {
          message: "El código no es válido",
          stutus: false,
          team: [],
        });
      }
    });

    socket.on("callTeams", async (data) => {
      retrieveCurrentTeams(data).then((result) => {
        socket.emit("getTeams", { Items: result.teams });
        socket.broadcast.emit("getTeams", { Items: result.teams });
      });
    });

    socket.on("onDisconnectTeam", async (data) => {
      deleteATeam(data.split("|")[0], data.split("|")[1]).then((_) => {
        retrieveCurrentTeams(data.split("|")[0]).then((result) => {
          if (result.length > 0) {
            socket.emit("onDisconnectTeamResponse", { Items: result.teams });
            socket.emit("getTeams", { Items: result.teams });
            socket.broadcast.emit("getTeams", { Items: result.teams });
          }
        });
      });
    });

    socket.on("startGame", (data) => {
      socket.broadcast.emit("onStartGame", data);
    });

    socket.on("getQuestion", async (data) => {
      let basicData = data.roomInfo;
      let currentTeams = await retrieveCurrentTeams(basicData[0]);

      let teamCopy = [...currentTeams.teams];
      let answeredQuestions = [];
      let availableTeam = data.teams;
      let currentTeam;

      if (availableTeam.length === 0) {
        availableTeam = teamCopy;
      }

      currentTeam = availableTeam.shift();
      availableTeam.push(currentTeam);

      teamCopy.forEach((e) => {
        Array.prototype.push.apply(answeredQuestions, e.questions);
      });
      answeredQuestions = [...new Set(answeredQuestions)];

      fetch(
        `https://socket-udem.herokuapp.com/categories/retrieveConcept/${data.category}`,
        {
          headers: {
            "Content-Type": "application/json",
            authorization: data.token,
          },
        }
      )
        .then((res) => res.json())
        .then(async (result) => {
          if (result.status) {
            let dummyQuestions = [];
            let findQuestion;
            if (basicData.length > 0) {
              dummyQuestions = [...result.data];
              dummyQuestions = dummyQuestions.map((e) => e._id);

              dummyQuestions = dummyQuestions.filter(
                (e) => !answeredQuestions.includes(e)
              );

              if (dummyQuestions.length > 0) {
                await shiftAssign(
                  currentTeam.teamId,
                  basicData[0],
                  dummyQuestions[0]
                );

                findQuestion = result.data.find(
                  (e) => e._id === dummyQuestions[0]
                );
              }
            }

            if (dummyQuestions.length > 0) {
              let bodySocket = {
                Items: {
                  Items:
                    basicData.length > 0
                      ? findQuestion.categories
                      : result.data[0].categories,
                },
                time: 60000,
                body: basicData.length > 0 ? findQuestion : result.data[0],
                idQuestion: findQuestion._id,
                currentTeam: currentTeam.teamId,
                nextTeam: availableTeam[0].teamId,
                teams: [...availableTeam].map((e) => e),
              };

              socket.emit("sendQuestion", bodySocket);
              socket.broadcast.emit("sendQuestion", bodySocket);
            } else {
              socket.emit("gameOver", { exit: "Juego terminado" });
              socket.broadcast.emit("gameOver", { exit: "Juego terminado" });
            }
          }
        });
    });

    socket.on("getScore", (data) => {
      let myData = data.split("|");
      addScore(myData[0], myData[1], parseInt(myData[2])).then((res) => {
        socket.broadcast.emit("sendScore", res);
      });
    });

    socket.on("onGameOver", (data) => {
      changeRoomState(data).then((_) => {
        socket.emit("gameOver", { exit: "Juego terminado" });
        socket.broadcast.emit("gameOver", { exit: "Juego terminado" });
      });
    });

    socket.on("changeRoomState", (data) => {
      changeRoomState(data).then((res) =>
        socket.broadcast.emit("changeRoomStateRes", res)
      );
    });

    socket.on("disconnect", () => {});
  }
};
