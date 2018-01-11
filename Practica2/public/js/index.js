"use strict";
$(() => {
    hideMyGames();
    hideFriendsGames();
    hideActiveGames();
    hideFamilyGames();
    hideNav();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
    $("#createGame").on("click", "button#newGame", onNewGameButtonClick);
    $("#joinGames").on("click", "button#joinGame", onJoinGameButtonClick);
    $("#menuSup").on("click", "a#partidasAmiguetes", onFriendsGamesClick);
    $("#menuSup").on("click", "a#familiar", onFamilyGamesClick);
    $("#menuSup").on("click", "a#misPartidas", onMyGamesClick);

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
function showFriendsGames() {
    $("#friendsGames").show();
    $("#friendsGamesTab").addClass("active");
}
function hideFriendsGames() {
    $("#friendsGames").hide();
    $("#friendsGamesTab").removeClass("active");
}
function showFamilyGames() {
    $("#familyGames").show();
    $("#familyGamesTab").addClass("active");
}
function hideFamilyGames() {
    $("#familyGames").hide();
    $("#familyGamesTab").removeClass("active");
}
function showActiveGames() {
    $("#activeGames").show();
}
function hideActiveGames() {
    $("#activeGames").hide();
}
function showNav() {
    $("#menuSup").show();
}
function hideNav() {
    $("#menuSup").hide();
}


function onFriendsGamesClick() {
    showFriendsGames();
    hideMyGames();
    hideActiveGames();
}
function onMyGamesClick() {
    showMyGames();
    hideActiveGames();
    hideFriendsGames();
}
function onFamilyGamesClick() {
    hideFriendsGames();
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
            console.log(data);
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
            console.log(data);
            $("#userId").prop("value", data.id);
            hideLogin();
            showNav();
            showMyGames();
        },
        error: function (data, textStatus, jqXHR) {
            alert("Usuario y/o contraseña no válido");
        }
    });
}
//Funcion que necesita autenticación
function onNewGameButtonClick(event) {
    let id = $("#userId").val();
    let name = $("#inputGameName").val();
    $.ajax({    //Peticion con auth pls
        type: "POST",
        url: "/createGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ userId: id, gameName: name }),
        success: function (data, textStatus, jqXHR) {
            
            console.log("SUCCESS"); //
        },
        error: function (data, textStatus, jqXHR) {
            alert("No se pudo crear el juego...");
        }
    });
}

function onJoinGameButtonClick(event) {
    let id = $("#userId").val();
    let gameId = $("#inputGameId").val();
    console.log("game id:");
    console.log(gameId);
    $.ajax({    //Peticion con auth pls

        type: "POST",
        url: "/joinGame",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ gameId: gameId, userId: id }),
        success: function (data, textStatus, jqXHR) {
            console.log("SUCCESS"); //
        },
        error: function (data, textStatus, jqXHR) {
            alert("No se puede unir al juego...");
        }
    });
}





