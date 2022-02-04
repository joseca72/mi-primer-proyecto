//BORRAR ENTRADA 

const getDB = require('../../database/getDB');

const { deletePhoto } = require('../../helpers');

const deleteEntry = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        // Obtenemos el id de la entrada que queremos borrar.
        const { idEntry } = req.params;

        // Seleccionamos el nombre de las fotos relaccionadas con la entrada.
        const [photos] = await connection.query(
            `SELECT name FROM entry_photos WHERE idEntry = ?`,
            [idEntry]
        );

        // Borramos las fotos del servidor.
        for (const photo of photos) {
            await deletePhoto(photo.name);
        }

        // Borramos la entrada.
        await connection.query(`DELETE FROM entries WHERE id = ?`, [idEntry]);

        res.send({
            status: 'ok',
            message: 'La entrada ha sido eliminada',
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = deleteEntry;
