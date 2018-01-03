"use strict";
$(()=> {
    hideMyGames();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
    $("#createGame").on("click", "button#newGame", onNewGameButtonClick);
    $("#joinGames").on("click", "button#joinGame", onJoinGameButtonClick);
});

function showLogin(){
    $("#signIn").show();
}
function hideLogin(){
    $("#signIn").hide();
}
function showMyGames(){
    $("#myGames").show();
}
function hideMyGames(){
    $("#myGames").hide();
}


function onRegisterButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    $.ajax({
        type:"POST",
        url: "/register",
        contentType: "application/json",
        data: JSON.stringify({ user: us, password: pass }),
        success: function(data, textStatus, jqXHR) {
            alert("Usuario creado correctamente");
        },
        error: function (data, textStatus, jqXHR) {
            console.log(data);
            if(data.status === 404)
                alert("Usuario y/o contraseña no válidos.");
            else
                alert("Ha ocurrido un error.");
        },
    });
}

function onLoginButtonClick(event) {
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    $.ajax({
        type:"POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({ user: us, password: pass }),
        success: function(data, textStatus, jqXHR) {
            console.log(data);
            $("#userId").prop("value", data.id);
            hideLogin();
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
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    let cadenaBase64 = btoa(us + ":" + pass);
    $.ajax({    //Peticion con auth pls
        type:"POST",
        url: "/createGame",
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic "+ cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({ userId: id, gameName: name }),
        success: function(data, textStatus, jqXHR) {
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
    let us = $("#inputLogin").val();
    let pass = $("#inputPassword").val();
    let cadenaBase64 = btoa(us + ":" + pass);
    console.log("game id:");
    console.log(gameId);
    $.ajax({    //Peticion con auth pls
        
        type:"POST",
        url: "/joinGame",
        beforeSend: function(req) {
            req.setRequestHeader("Authorization", "Basic "+ cadenaBase64);
        },
        contentType: "application/json",
        data: JSON.stringify({gameId: gameId, userId: id }),
        success: function(data, textStatus, jqXHR) {
            console.log("SUCCESS"); //
        },
        error: function (data, textStatus, jqXHR) {
            alert("No se puede unir al juego...");
        }
    });

}



