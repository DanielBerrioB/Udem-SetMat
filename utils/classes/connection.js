const {
  verifyCode,
  addTeam,
  retrieveCurrentTeams,
  deleteATeam
} = require("./sockets");

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
      deleteATeam(data.split("|")[0], data.split("|")[1]).then(result => {
        socket.emit("onDisconnectTeamResponse", result)
        retrieveCurrentTeams(data.split("|")[0]).then(result => {
          socket.emit("getTeams", { Items: result.teams });
          socket.broadcast.emit("getTeams", { Items: result.teams });
        });
      });
    });

    socket.on("disconnect", async data => {
      console.log("desconectado");
    });
  }
};
