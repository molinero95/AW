const express = require("express");
const path = require("path");
const config = require("./config");
const bodyParser = require("body-parser");

const app = express();

let idCounter = 5;

let tasks = [
    {
        id: 1,
        text: "Preparar práctica PDAP",
    },
    {
        id: 2,
        text: "Mirar fechas congreso",
    },
    {
        id: 3,
        text: "Ir al supermercado",
    },
    {
        id: 4,
        text: "Mudanza",
    }
];


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

app.get("/", (request, response) => {
    response.redirect("/tasks.html");
});

app.get("/tasks", (request, response) => {
    // Implementar
});

app.post("/tasks", (request, response) => {
    let texto = request.body.text;
    let newTask = {
        id: idCounter++,
        text: texto,
    };
    tasks.push(newTask);
    response.status(200);
    response.json(newTask);
});

app.delete("/tasks/:id", (request, response) => {
    // Implementar
});

app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});