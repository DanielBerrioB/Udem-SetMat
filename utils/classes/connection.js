const { verifyCode, addTeam, retrieveCurrentTeams } = require("../sockets");

module.exports = class Connection {
    constructor() {
        this.socket
    }

    async initEvents() {
        let connection = this
        let socket = connection.socket;

        socket.emit("main", { message: "I ❤ la loma. puto" });

        socket.on("joinRoom", async data => {

            let socketData = { code: data.split("|")[0], team: data.split("|")[1] }
            let res = await verifyCode(socketData.code);
            if (res) {
                let team = await addTeam(socketData.code, socketData.team);
                if (team.status) {
                    team.message = "Equipo añadido";
                } else {
                    team.message = "Error intenta de nuevo";
                }
                socket.emit("response", team);
            } else {
                socket.emit("response", {
                    message: "El código no es válido",
                    stutus: false,
                    team: []
                });
            }

        });


        socket.on("callTeams", async data => {

            let Items = [
                {
                    "team": "1",
                    "score": 0
                },
                {
                    "team": "2",
                    "score": 0
                },
                {
                    "team": "3",
                    "score": 0
                }
            ]
            //console.log(datos)
            socket.emit("getTeams" , await retrieveCurrentTeams(data));
        })

        socket.on("disconnect", () => {
            console.log("desconectado")
        })
    }
}