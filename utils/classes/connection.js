const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam
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

    socket.emit("main", { message: "Principal 23" });
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

    socket.on("getQuestion", _ => {
      fetch("https://socket-udem.herokuapp.com/categories/retrieveConcepts")
        .then(res => res.json())
        .then(result => {
          if (result.status) {
            socket.emit("sendQuestion", {
              Items: {
                Items: result.data[0].categories
              },
              time: 60000,
              body: result.data[0]
            });
            socket.broadcast.emit("sendQuestion", {
              Items: {
                Items: result.data[0].categories
              },
              time: 60000,
              body: result.data[0]
            });
            var cont = 60;
            var timer = setInterval(() => {
              socket.emit("timer", cont);
              socket.broadcast.emit("timer", cont);
              cont--;
            }, 1000);

            setTimeout(() => {
              clearInterval(timer);
            }, 62000);

            result.data.shift();
            result.data.forEach((e, i) => {
              setTimeout(() => {
                var cont = 60;
                var timer = setInterval(() => {
                  socket.emit("timer", cont);
                  socket.broadcast.emit("timer", cont);
                  cont--;
                }, 1000);

                setTimeout(() => {
                  clearInterval(timer);
                }, 62000);

                socket.emit("sendQuestion", {
                  Items: {
                    Items: e.categories
                  },
                  time: 60000,
                  body: e
                });
                socket.broadcast.emit("sendQuestion", {
                  Items: {
                    Items: e.categories
                  },
                  time: 60000,
                  body: e
                });
              }, 15000 * (i + 1));
            });
          }
        });
    });

    socket.on("disconnect", async data => {
      console.log("desconectado");
    });
  }
};
