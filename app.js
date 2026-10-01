const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

// ==========================================
// CONFIGURACIÓN
// ==========================================

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==========================================
// CONEXIÓN A MYSQL
// ==========================================

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// ==========================================
// PÁGINA PRINCIPAL
// ==========================================

app.get("/", async (req, res) => {
    try {

        // Obtener países
        const [paises] = await db.query(`
            SELECT *
            FROM paises
            ORDER BY pais_id
        `);

        // Obtener provincias junto con el nombre del país
        const [provincias] = await db.query(`
            SELECT
                provincias.pro_id,
                provincias.pais_id,
                provincias.pro_descripcion,
                paises.pais_descrion
            FROM provincias
            INNER JOIN paises
                ON provincias.pais_id = paises.pais_id
            ORDER BY provincias.pro_id
        `);

        res.render("index", {
            paises: paises,
            provincias: provincias
        });

    } catch (error) {

        console.error("ERROR MYSQL:", error);

        res.status(500).send(
            "Error al obtener los datos de la base de datos"
        );
    }
});

// ==========================================
// CREAR PAÍS
// ==========================================

app.post("/paises", async (req, res) => {

    try {

        const { pais_descrion } = req.body;

        await db.query(
            `
            INSERT INTO paises (pais_descrion)
            VALUES (?)
            `,
            [pais_descrion]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL CREAR PAÍS:", error);

        res.status(500).send(
            "Error al crear el país"
        );
    }
});

// ==========================================
// EDITAR PAÍS
// ==========================================

app.post("/paises/:id/editar", async (req, res) => {

    try {

        const { pais_descrion } = req.body;

        await db.query(
            `
            UPDATE paises
            SET pais_descrion = ?
            WHERE pais_id = ?
            `,
            [
                pais_descrion,
                req.params.id
            ]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL EDITAR PAÍS:", error);

        res.status(500).send(
            "Error al editar el país"
        );
    }
});

// ==========================================
// ELIMINAR PAÍS
// ==========================================

app.post("/paises/:id/eliminar", async (req, res) => {

    try {

        // Primero eliminamos las provincias
        // asociadas al país
        await db.query(
            `
            DELETE FROM provincias
            WHERE pais_id = ?
            `,
            [req.params.id]
        );

        // Después eliminamos el país
        await db.query(
            `
            DELETE FROM paises
            WHERE pais_id = ?
            `,
            [req.params.id]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL ELIMINAR PAÍS:", error);

        res.status(500).send(
            "Error al eliminar el país"
        );
    }
});

// ==========================================
// CREAR PROVINCIA
// ==========================================

app.post("/provincias", async (req, res) => {

    try {

        const {
            pais_id,
            pro_descripcion
        } = req.body;

        await db.query(
            `
            INSERT INTO provincias
            (
                pais_id,
                pro_descripcion
            )
            VALUES (?, ?)
            `,
            [
                pais_id,
                pro_descripcion
            ]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL CREAR PROVINCIA:", error);

        res.status(500).send(
            "Error al crear la provincia"
        );
    }
});

// ==========================================
// EDITAR PROVINCIA
// ==========================================

app.post("/provincias/:id/editar", async (req, res) => {

    try {

        const {
            pais_id,
            pro_descripcion
        } = req.body;

        await db.query(
            `
            UPDATE provincias
            SET
                pais_id = ?,
                pro_descripcion = ?
            WHERE pro_id = ?
            `,
            [
                pais_id,
                pro_descripcion,
                req.params.id
            ]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL EDITAR PROVINCIA:", error);

        res.status(500).send(
            "Error al editar la provincia"
        );
    }
});

// ==========================================
// ELIMINAR PROVINCIA
// ==========================================

app.post("/provincias/:id/eliminar", async (req, res) => {

    try {

        await db.query(
            `
            DELETE FROM provincias
            WHERE pro_id = ?
            `,
            [req.params.id]
        );

        res.redirect("/");

    } catch (error) {

        console.error("ERROR AL ELIMINAR PROVINCIA:", error);

        res.status(500).send(
            "Error al eliminar la provincia"
        );
    }
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(3000, () => {

    console.log("-------------------------------------");
    console.log("Servidor funcionando correctamente");
    console.log("http://localhost:3000");
    console.log("-------------------------------------");

});