"use strict";
$(() => {
    hideMyGames();
    hideNav();
    hideGame();
    hideNavBar();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
    $("#createGame").on("click", "button#newGame", onNewGameButtonClick);
    $("#joinGames").on("click", "button#joinGame", onJoinGameButtonClick);
    $("#menuSup").on("click", "a#misPartidas", onMyGamesClick);
    $("#partida").on("click", "button#update", updateGameClick);
    $("#logoutBar").on("click", "button#logoutBtn", onLogoutButtonClick);
});
let cadenaBase64 = "";

////////// INICIO SHOW/HIDE //////////

//Elimina los juegos del menu nav para el logout
function removeGameTabs() {
    $(".tab").remove();
}
//Muestra el formulario de login
function showLogin() {
    $("#signIn").show();
}
//Oculta el formulario de login
function hideLogin() {
    $("#signIn").hide();
}
//Muestra la pestaña MyGames
function showMyGames() {
    $("#myGames").show();
    setInactiveActualTab();
    $("#myGamesTab").addClass("active");
}
//Oculta la pestaña MyGames
function hideMyGames() {
    $("#myGames").hide();
    $("#myGamesTab").removeClass("active");
}
//Oculta la pestaña anterior y muestra la seleccionada
function showGameTabId(id) {
    setInactiveActualTab();
    hideMyGames();
    $("#" + id).addClass("active");
    $("#game").show();
    //Mostrar el juego aqui
}
//Oculta el juego
function hideGame() {
    $("#game").hide();
}

//Muestra la imagen del login
function showImage() {
    $("#imagen").show();
}
 //oculta las cartas de la mesa
function hideCards(){
    $("#userCards").hide();
    $("#tableCards").hide();
}

function showCards(){
    $("#userCards").show();
    $("#tableCards").show();
}


//Muestra el menu de partidas
function showNav() {
    $("#menuSup").show();
}
//Oculta el menú de partidas
function hideNav() {
    $("#menuSup").hide();
}
//Muestra el menú negro
function showNavBar() {
    $("#barraSup").show();
}
//Oculta el menú negro
function hideNavBar() {
    $("#barraSup").hide();
}
//Oculta la imagen del login
function hideImage() {
    $("#imagen").hide();
}



////////// FIN SHOW/HIDE //////////

////////// INICIO CLICKS //////////

//Al seleccionar la pestaña "Mis partidas"
function onMyGamesClick() {
    setInactiveActualTab();
    showMyGames();
    hideGame();
}
//Al pulsar sobre el botón "Registrarse"
function onRegisterButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    register(us, pass, (res) => {
        alert(res);
    });
}
//Al pulsar sobre el boton "Iniciar sesión"
function onLoginButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    cadenaBase64 = btoa(us + ":" + pass);
    login(us, pass, (res) => {
        if (res) {
            hideLogin();
            hideImage();
            showNavBar();
            showNav();
            showMyGames();
            userGamesInfo(res, (data) => {
                if (data.ids) {
                    for (let i = 0; i < data.ids.length; i++) {
                        addToNav(data.names[i], data.ids[i]);
                    }
                }
                $("#name").text(us);
            });
        }
        else 
            alert("Usuario y/o contraseña no válido");
    });
}

//Al pulsar sobre "Desconectar"
function onLogoutButtonClick(event) {
    cadenaBase64 = "";
    hideMyGames();
    hideNav();
    hideGame();
    removeGameTabs();
    hideNavBar();
    showImage();
    showLogin();
}

//Al pulsar sobre "Crear"
function onNewGameButtonClick(event) {
    let id = $("#userId").val();
    let name = $("#inputGameName").val();
    newGame(id, name, (data) => {
        if(data) 
            addToNav(name, data.id);
        else
            alert("No se pudo crear el juego...");
    });   
}

//Al pulsar sobre "Unirse"
function onJoinGameButtonClick(event) {
    let id = $("#userId").val();
    let gameId = $("#inputGameId").val();
    joinGame(gameId, id, (data) => {
        if(!data.error){
            addToNav(data.name, gameId);
            alert("Partida: '" + data.name + "' agregada correctamente");
        }
        else
            alert(data.error);     
    });
    
}
//Al pulsar sobre "Actualizar partida"
function updateGameClick(event) {
    let id = Number($("#menuSup > .active").attr("id"));
    getGameStatus(id, (data) => {
        setGamePlayersDOM(data, null);
    }); 
}
////////// FIN CLICKS //////////


//Añade los juegos a las pestañas
function addToNav(name, id) {
    let elemento = "<li id=" + String(id) + "> <a>" + name + "</a></li>";
    $("#menuSup").append(elemento);
    $("#" + id).addClass("tab");
    $("#" + String(id)).on("click", (event) => {
        playGame(id);
    });
}

//Al pulsar sobre una pestaña se ejecuta esta funcion que se encargará de manejar la interfaz de juego
function playGame(id) {
    $("#needId").text("El id de la partida es " + id);
    setInactiveActualTab();
    showGameTabId(id);
    getGameStatus(id, (data) => {
        setGamePlayersDOM(data, null);
        if(data.names.length != 4){
            hideCards();
        }
        else{
            showCards();
        }
        console.log(data);
    }); 
}

//Establece la tabla de jugadores, en caso de no estar completa incluye la cadena
// "Esperando jugador" a la posicion de la tabla
function setGamePlayersDOM(players, cards) {
    let ultimo;
    for (let i = 0; i < players.names.length; i++) {
        let str = "#player" + String(i + 1);
        $(str).text(players.names[i]);
        ultimo = i;
    }
    ultimo++;
    if (ultimo < 3) {
        for (let i = ultimo; i < 4; i++) {
            let str = "#player" + String(i + 1);
            $(str).text("Esperando jugador...");
        }
    }
    checkIfComplete(players);
}

//Comprueba si la partida está completa y si no lo está muestra el mensaje de que no está completa
function checkIfComplete(players) {
    $("#notComplete").hide();
    if (players.names.length !== 4) {
        $("#notComplete").show();
        return false;
    }
    else{

    }
    return true;
}

/*Quita la clase active a la partida actual en el menú */
function setInactiveActualTab() {
    $("#menuSup > .active").removeClass("active");
}

////////// INICIO AJAX //////////

//Registro: devuelve el mensaje a mostrar en un alert
function register(user, password, callback) {
    $.ajax({
        type: "POST",
        url: "/register",
        contentType: "application/json",
        data: JSON.stringify({ user: user, password: password }),
        success: function (data, textStatus, jqXHR) {
            callback("Usuario creado correctamente");
        },
        error: function (data, textStatus, jqXHR) {
            if (data.status === 404)
                callback("Usuario y/o contraseña no válidos.");
            else
                callback("Ha ocurrido un error.");
        },
    });
}

//Login: Si es correcto devolverá los datos, si no devolvemos un null
function login(user, password, callback) {
    $.ajax({
        type: "POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({ user: user, password: password }),
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (data, textStatus, jqXHR) {
            callback(null);
        }
    });
}

//UserGamesInfo: Si sale bien devuelve las partidas del usuario, si no, null
function userGamesInfo(data, callback) {
    $.ajax({
        type: "GET",
        url: "/userGamesInfo",
        contentType: "application/json",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        data: JSON.stringify({ id: data.id }),
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (data, textStatus, jqXHR) {
            callback(null);
        }
    });
}

//NewGame: crea una nueva partida, devuelve el id de la partida si sale bien
function newGame(id, name, callback){
    $.ajax({
        type: "POST",
        url: "/createGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ userId: id, gameName: name }),
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (data, textStatus, jqXHR) {
            callback(null);
        }
    });
}

function joinGame(gameId, id, callback){
    $.ajax({
        type: "POST",
        url: "/joinGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ gameId: gameId, userId: id }),
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (data, textStatus, jqXHR) {
            callback({error: data.responseJSON.error});
        }
    });
}

//getGameStatus: devuelve el estado de una partida
function getGameStatus(actualMatch, callback) {
    $.ajax({
        type: "GET",
        url: "/status/" + actualMatch,
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            callback(data);
            //Actualizar datos
        },
        error: function (data, textStatus, jqXHR) {
            callback(null);
        }
    });
}

////////// FIN AJAX //////////
