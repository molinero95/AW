const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
const estaticos = path.join(__dirname, "static");
app.use(express.static(estaticos));

function logger (req, res, next) {
    console.log(`Recibida peticion: ${req.url}`);
    next();
}
app.use(logger);

app.get('/', (req, res) => {
    res.status(200);
    //if(sesion)
    res.redirect('/profile.html');
    //else
    //res.redirect('/login.html');
})

app.get('/profile.html', (req, res) => {
    let usuario = new Object();
    usuario.nombre = "Pepito Pérez Rodriguez";
    usuario.edad = 33;
    usuario.sexo = "Hombre";
    usuario.puntos = 100;
    usuario.foto = "icons/Fatso-01.png";
    //el render se encarga de llamar al .ejs
    res.render("profile", {user: usuario})
    res.status(200);
});

app.listen(3000, () => {
    console.log(`Server started on port`);
});