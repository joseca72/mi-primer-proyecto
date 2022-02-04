//RETORNA EL LISTADO DE ENTRADAS


const getDB = require('../../database/getDB');

const getEntry = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        // Obtenemos el id de la entrada que queremos obtener.
        const { idEntry } = req.params;

        // Obtenemos la información de la entrada de la base de datos.
        const [entries] = await connection.query(
            `
                SELECT entries.id, entries.title, entries.description, entries.createdAt, entries.idUser, AVG(IFNULL(entry_votes.vote, 0)) AS votes
                FROM entries
                LEFT JOIN entry_votes ON (entries.id = entry_votes.idEntry)
                WHERE entries.id = ?
            `,
            [idEntry]
        );

        // Obtenemos las fotos de la entrada.
        const [photos] = await connection.query(
            `SELECT name FROM entry_photos WHERE idEntry = ?`,
            [idEntry]
        );

        res.send({
            status: 'ok',
            data: {
                entry: {
                    ...entries[0],
                    photos,
                },
            },
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = getEntry;
