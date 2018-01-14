"use strict";
$(() => {
    hideMyGames();
    hideNav();
    hideGame();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
    $("#createGame").on("click", "button#newGame", onNewGameButtonClick);
    $("#joinGames").on("click", "button#joinGame", onJoinGameButtonClick);
    $("#menuSup").on("click", "a#misPartidas", onMyGamesClick);
    $("#partida").on("click", "button#update", updateGameClick);

});


function showLogin() {
    $("#signIn").show();
}
function hideLogin() {
    $("#signIn").hide();
}
function showMyGames() {
    $("#myGames").show();
    $("#myGamesTab").addClass("active");
}
function hideMyGames() {
    $("#myGames").hide();
    $("#myGamesTab").removeClass("active");
}
function showGameTabId(id) {
    hideMyGames();
    $("#" + id).addClass("active");
    $("#game").show();
    //Añadir codigo del juego en sí
}
function hideGame() {
    $("#game").hide();
}
function showNav() {
    $("#menuSup").show();
}
function hideNav() {
    $("#menuSup").hide();
}
function onGameClick(id) {
    showGameTabId(id);
    hideMyGames();
}
function onMyGamesClick() {
    setInactiveActualTab();
    showMyGames();
    hideGame();
}

function setInactiveActualTab() {
    $("#menuSup > .active").removeClass("active");
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

let cadenaBase64 = "";

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

let actualMatch = -1;


function updateGameClick(event) {
    getGameStatus();
}

function getGameStatus() {
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
    $("#menuSup").append("<li id=" + String(id) + "> <a>" + name + "</a></li>");
    $("#" + String(id)).on("click", (event) => {
        actualMatch = id;
        playGame();
    });
}

function playGame() {
    setInactiveActualTab();
    showGameTabId(actualMatch);
    getGameStatus();
}

function setGamePlayersDOM(players, cards) {
    for (let i = 0; i < players.names.length; i++) {
        let str = "#player" + String(i + 1);
        $(str).text(players.names[i]);
    }
}