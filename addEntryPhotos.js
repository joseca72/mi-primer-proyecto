//ANADE UNA IMAGEN A UNA ENTRADA

const getDB = require('../../database/getDB');

const newEntrySchema = require('../../schemas/newEntrySchema');

const { savePhoto, validate } = require('../../helpers');

const newEntry = async (req, res, next) => {
    let connection;

    try {
        connection = await getDB();

        // Validamos las propiedades del body.
        await validate(newEntrySchema, req.body);

        // Obtenemos las propiedades del body.
        const { title, description } = req.body;

        // Obtenemos el id del usuario que está creando la entrada.
        const idReqUser = req.userAuth.id;

        // Creamos la entrada y obtenemos el valor que retorna "connection.query".
        const [newEntry] = await connection.query(
            `INSERT INTO entries (title, description, idUser, createdAt) VALUES (?, ?, ?, ?)`,
            [title, description, idReqUser, new Date()]
        );

        // Obtenemos el id de la entrada que acabamos de crear.
        const idEntry = newEntry.insertId;

        // Comprobamos que "req.files" exista y si tiene uno o más archivos (fotos).
        if (req.files && Object.keys(req.files).length > 0) {
            // Recorremos los valores de "req.files". Por si las moscas, nos quedamos únicamente
            // con las tres primeras posiciones del array. Si hay más serán ignoradas.
            for (const photo of Object.values(req.files).slice(0, 3)) {
                // Guardamos la foto en el servidor y obtenemos su nombre.
                const photoName = await savePhoto(photo, 1);

                // Guardamos la foto en la tabla de fotos.
                await connection.query(
                    `INSERT INTO entry_photos (name, idEntry, createdAt) VALUES (?, ?, ?)`,
                    [photoName, idEntry, new Date()]
                );
            }
        }

        res.send({
            status: 'ok',
            message: 'La entrada ha sido creada',
        });
    } catch (error) {
        next(error);
    } finally {
        if (connection) connection.release();
    }
};

module.exports = newEntry;
