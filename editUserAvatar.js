// EDITAR AVATAR 

const getDB = require('../../database/getDB');

const { savePhoto, deletePhoto } = require('../../helpers');

const editUserAvatar = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        // Obtenemos el id del usuario que queremos editar.
        const { idUser } = req.params;

        // Si la propiedad "req.files.avatar" no existe lanzamos un error. Dato que esta propiedad
        // podría no existir tenemos que comprobobar previamente si existe antes de comprobar si existe
        // "req.files.avatar".
        if (!(req.files && req.files.avatar)) {
            const error = new Error('Faltan campos');
            error.httpStatus = 400;
            throw error;
        }

        // Obtenemos el avatar del usuario actual.
        const [users] = await connection.query(
            `SELECT avatar FROM users WHERE id = ?`,
            [idUser]
        );

        // Comprobamos si el usuario que queremos editar ya tiene avatar.
        if (users[0].avatar) {
            // Eliminamos el avatar del disco (del servidor).
            await deletePhoto(users[0].avatar);
        }

        // Guardamos el nuevo avatar en el servidor y obtenermos el nombre del mismo.
        const avatarName = await savePhoto(req.files.avatar, 0);

        // Actualizamos el usuario con el nombre del nuevo avatar.
        await connection.query(
            `UPDATE users SET avatar = ?, modifiedAt = ? WHERE id = ?`,
            [avatarName, new Date(), idUser]
        );

        res.send({
            status: 'ok',
            message: 'Usuario actualizado',
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = editUserAvatar;
