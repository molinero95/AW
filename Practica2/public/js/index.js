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
//Muestra el menu de partidas
function showNav() {
    $("#menuSup").show();
}
//Oculta el menú de partidas
function hideNav() {
    $("#menuSup").hide();
}
//Muestra el menú negro
function showNavBar(){
    $("#barraSup").show();
}
//Oculta el menú negro
function hideNavBar(){
    $("#barraSup").hide();
}
//Oculta la imagen del login
function hideImage(){
    $("#imagen").hide();
}
//Muestra la imagen del login
function showImage(){
    $("#imagen").show();
}

//Todos los eventos Click aqui
function onGameClick(id) {
    showGameTabId(id);
}
function onMyGamesClick() {
    setInactiveActualTab();
    showMyGames();
    hideGame();
}
function onRegisterButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    $.ajax({
        type: "POST",
        url: "/register",
        contentType: "application/json",
        data: JSON.stringify({ user: us, password: pass }),
        success: function (data, textStatus, jqXHR) {
            alert("Usuario creado correctamente");
        },
        error: function (data, textStatus, jqXHR) {
            if (data.status === 404)
                alert("Usuario y/o contraseña no válidos.");
            else
                alert("Ha ocurrido un error.");
        },
    });
}
function onLoginButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    cadenaBase64 = btoa(us + ":" + pass);
    $.ajax({
        type: "POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({ user: us, password: pass }),
        success: function (data, textStatus, jqXHR) {
            $("#userId").prop("value", data.id);
            hideLogin();
            hideImage();
            showNavBar();
            showNav();
            showMyGames();
            $.ajax({
                type: "GET",
                url: "/userGameInfo",
                contentType: "application/json",
                beforeSend: function (req) {
                    req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
                },
                data: JSON.stringify({ id: data.id }),
                success: function (data, textStatus, jqXHR) {
                    if (data.ids) {
                        for (let i = 0; i < data.ids.length; i++) {
                            addToNav(data.names[i], data.ids[i]);
                        }
                    }
                    console.log(us);
                    $("#name").text(us);
                },
                error: function (data, textStatus, jqXHR) {
                    //
                }
            });
        },
        error: function (data, textStatus, jqXHR) {
            alert("Usuario y/o contraseña no válido");
        }
    });
}
function onLogoutButtonClick(event){
    cadenaBase64 = "";
    hideMyGames();
    hideNav();
    hideGame();
    removeGameTabs();
    hideNavBar();
    showImage();
    showLogin(); 
}
function onNewGameButtonClick(event) {
    let id = $("#userId").val();
    let name = $("#inputGameName").val();
    $.ajax({
        type: "POST",
        url: "/createGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ userId: id, gameName: name }),
        success: function (data, textStatus, jqXHR) {
            addToNav(name, data.id);
        },
        error: function (data, textStatus, jqXHR) {
            alert("No se pudo crear el juego...");
        }
    });
}
function onJoinGameButtonClick(event) {
    let id = $("#userId").val();
    let gameId = $("#inputGameId").val();
    $.ajax({
        type: "POST",
        url: "/joinGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ gameId: gameId, userId: id }),
        success: function (data, textStatus, jqXHR) {
            addToNav(data.name, gameId);
            alert("Partida: '" + data.name + "' agregada correctamente")
        },
        error: function (data, textStatus, jqXHR) {
            alert(data.responseJSON.error);
        }
    });
}
function updateGameClick(event) {
    let id = Number($("#menuSup > .active").attr("id"));
    console.log(id);
    getGameStatus(id);
}
//Fin clicks

function getGameStatus(actualMatch) {
    $.ajax({
        type: "GET",
        url: "/status/" + actualMatch,
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            //Actualizar datos
            setGamePlayersDOM(data, null);
        },
        error: function (data, textStatus, jqXHR) {
            //Error
        }
    });
}

function addToNav(name, id) {
    let elemento = "<li id=" + String(id) + "> <a>" + name + "</a></li>"; 
    $("#menuSup").append(elemento);
    $("#"+id).addClass("tab");
    $("#" + String(id)).on("click", (event) => {
        playGame(id);
    });
}

function playGame(id) {
    setInactiveActualTab();
    showGameTabId(id);
    getGameStatus(id);
}

function setGamePlayersDOM(players, cards) {
    for (let i = 0; i < players.names.length; i++) {
        let str = "#player" + String(i + 1);
        $(str).text(players.names[i]);
    }
}

/*Quita la clase active a la partida actual en el menú */
function setInactiveActualTab() {
    $("#menuSup > .active").removeClass("active");
}

