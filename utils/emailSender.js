const dotenv = require("dotenv");
const sgMail = require("@sendgrid/mail");
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const url = "https://set-mat.herokuapp.com/";

/**
 * This function sends an email to a user given the following credentials:
 * @param {String} email
 * @param {String} user
 * @param {String} token
 */
function restoreMyPassword(email, user, token) {
  const msg = {
    to: email,
    from: "diegoassia@gmail.com",
    subject: "Restaurar contraseña",
    html: ` <div>
                <h2>Hola ${user},</h2>
                <p>En el siguiente enlace podrás cambiar tu contraseña</p>
                <a href=${url}/forgotPasswordRestore/user=${user}/token=${token} style="display: block;
                    width: 150px;
                    height: 25px;
                    background: blue;
                    padding: 10px;
                    font-size: 15px;
                    text-align: center;
                    border-radius: 5px;
                    color: white;">Restaurar contraseña</a>
                <p>Muchas gracias</p>
            </div>`,
  };
  sgMail.send(msg);
}

module.exports = { restoreMyPassword };
