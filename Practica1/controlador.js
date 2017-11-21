const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
const estaticos = path.join(__dirname, "static");
app.use(express.static(estaticos));


app.use(function logger (req, res, next) {
    console.log(`Recibida peticion: ${req.url}`);
    next();
});


app.get('/', (req, res) => {
    res.status(200);
    //if(sesion)
    res.redirect('/profile.html');
    //else
    //res.redirect('/login.html');
})


app.get('/profile', (req, res) => {
    let usuario = new Object();
    usuario.nombre = "Pepito Pérez Rodriguez";
    usuario.edad = 33;
    usuario.sexo = "Hombre";
    usuario.puntos = 100;
    usuario.foto = "icons/Fatso-01.png";
    //el render se encarga de llamar al .ejs
    res.status(200);    
    res.render("profile", {user: usuario})
});



/*
Este middleware sera el encargado de comprobar si el usuario esta iniciado al 
acceder al login/register.
Si no hay usuario iniciado, redirige a login.
Si el usuario está iniciado, redirige a profile.
*/
app.use(function chekLogged (req, res, next){
    let sesion; //quitar, ya veremos sesiones
    if(!sesion) //Cuidado, si usuario no iniciado y queremos pagina rara redirige a login
        next();
    else
        res.redirect('/profile');
});

app.get('/login', (req, res) => {
    res.status(200);
    res.render("login");
})

app.get('/register', (req, res) => {
    res.status(200);
    res.render("register");
})




app.listen(3000, () => {
    console.log(`Server started on port 3000`);
});