"use strict";
$(() => {
    hideMyGames();
    hideNav();
    hideGame();
    hideNavBar();
    hideSelector();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
    $("#createGame").on("click", "button#newGame", onNewGameButtonClick);
    $("#joinGames").on("click", "button#joinGame", onJoinGameButtonClick);
    $("#menuSup").on("click", "a#misPartidas", onMyGamesClick);
    $("#updateButton").on("click", "button#botonActualizar", updateGameClick);
    $("#logoutBar").on("click", "button#logoutBtn", onLogoutButtonClick);
    $("#gameButtons").on("click", "button#seleccionadas", onSelectedClick);
    $("#gameButtons").on("click", "button#mentiroso", onLiarClick);
    $("#gameButtons").on("click", "button#descartar", onDiscardClick);
    $("#firstCardSelector").on("click", "button.firstCardBtn", onFirstCardClick);
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
function hideCards() {
    $("#userCards").hide();
    $("#tableCards").hide();
}

function showCards() {
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
//Muestra el panel de cartas sobre la mesa
function showClearTableMsg() {
    $("#clearTable").show();
}
//Oculta el panel de cartas sobre la mesa
function hideClearTableMsg() {
    $("#clearTable").hide();
}
//Muestra el selector de cartas para el primer jugador de la ronda
function showSelector() {
    $("#firstCardSelector").show();
}
//Oculta el selector de cartas para el primer jugador de la ronda
function hideSelector() {
    $("#firstCardSelector").hide();
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
                $("#name").text(us);    //Establecemos el nombre del jugador
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
        if (data)
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
        if (!data.error) {
            addToNav(data.name, gameId);
            alert("Partida: '" + data.name + "' agregada correctamente");
        }
        else
            alert(data.error);
    });

}
//Al pulsar sobre "Actualizar partida"
//TODO
function updateGameClick(event) {
    let id = getGameId();
    console.log(id);
    playGame(id);
}
//Al pulsar sobre el boton "jugar cartas seleccionadas"
function onSelectedClick(event) {
    //Coger cartas seleccionadas
    let selected = []
    $("#cartasUsr .selectedCard").each(function () {
        selected.push(getCardByImg($(this).prop("attributes")[0].nodeValue)); //Cuidado aqui, mejor con URL entera
        $(this).remove();
    });
    if (selected.length === 0)
        alert("Debes seleccionar alguna carta");
    else if (selected.length > 3)
        alert("Sólo puedes enviar 3 cartas como máximo");
    else { //Numero de cartas seleccionadas es correcto
        //Si la mesa está vacia y han seleccionado 0 numeros (Primer jugador)
        if ($("#clearTable").css("display") !== "none" && $("#firstCardSelector .btn-primary").length === 0)  //Mal
            alert("Tiene que seleccionar un número o figura");
        //Si la mesa está vacia y han seleccionado mas de 1 número (Primer jugador)
        else if ($("#clearTable").css("display") !== "none" && $("#firstCardSelector .btn-primary").length > 1) { //Mal
            alert("Seleccione sólo un número ó figura");
            console.log($("#firstCardSelector .btn-primary").length);
        }
        else {
            let number;
            //Si se muetra el error de "No hay cartas sobre la mesa"...
            if ($("#clearTable").css("display") !== "none")  //Si no hay cartas sobre la mesa
                number = $("#firstCardSelector .btn-primary").text() //obtenemos el numero seleccionado
            else//Obtenemos el numero si hay cartas sobre la mesa
                number = getCardByImg($("#cardsTab img").first()[0].attributes.src.value).split(" ")[0];
            
            playerMovesQuery(selected, number);
            hideSelector(()=> {
                hideClearTableMsg();
                //Deshabilitamos botones, actualizamos tabla y ponemos cartas sobre la mesa
                $("#mentiroso").prop("disabled", true);
                $("#seleccionadas").prop("disabled", true);
                playGame(getGameId()); //Volvemos a mostrar lo que hay que mostrar  
            }); 
            
        }
    }
}

//Al pulsar sobre "¡Mentiroso!"
function onLiarClick(event) {
    checkIfLiar(res =>{
        console.log(res);
        if(res.liar)
            alert("Has acertado!");
        else
            alert("Vaya... Parece que has fallado, el jugador anterior no mentía");
        playGame(getGameId());

    });
}

function onDiscardClick(event){
    discardCards(res => {
        console.log(res);
        if(!res)
            alert("No hay cartas para descartar");
        else
            alert("Descarte completado");
        playGame(getGameId());
    });
}

function onFirstCardClick(event) {
    let card = $(event.target);
    if (card.hasClass("btn-primary"))
        card.removeClass("btn-primary");
    else
        card.addClass("btn-primary");
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
        if (!checkIfComplete(data)) {   //Partida no completa
            let players = [];
            let i = 0;
            while (i < data.names.length) {
                players.push(data.names[i]);
                i++;
            }
            for (i; i < 4; i++) {
                players.push("Esperando a jugador...");
            }
            hideCards();
            createGameTable(players, null, null);
        }
        else {  //Partida completa
            console.log(data);
            showCards();
            $("#cartasUsr").empty();
            $("#cardsTab").empty();
            createGameTable(data.status.names, data.status.numCards, data.status.turn);
            showMyCards(data.status.myCards);
            if (data.status.table !== "NULL") {
                showTableCards(data.status.table.split(","));
                hideClearTableMsg();
            }
            else
                showClearTableMsg();
            if (data.status.turn === getPlayerName()) { //turno del jugador
                $("#seleccionadas").prop("disabled", false);
                if (data.status.table === "NULL") {  //No hay cartas sobre la mesa, mostrar selector de numer o figura
                    showClearTableMsg();
                    showSelector();
                    $("#mentiroso").prop("disabled", true);
                }
                else {    //Hay cartas sobre la mesa
                    $("#mentiroso").prop("disabled", false);
                    hideSelector();
                    hideClearTableMsg();
                }
            }
            else {   //Le toca a otro
                $("#seleccionadas").prop("disabled", true);
                $("#mentiroso").prop("disabled", true);
            }
        }
    });
}


/*
Formato
<tr>
    <td>
        <strong> Jugador </strong>
    </td>
    <td>
        <strong>Nº Cartas </strong>
    </td>
</tr>
<tr>
    <td class="nombrePlayer name"></td>
    <td class="nombrePlayer numCards"></td>
</tr>
*/
//Establece la cabecera de la tabla
function setTableHeader(){
    let padre = $("#tabla");
    let fila = $("<tr></tr>");
    let col1 = $("<td></td>");
    let strong1 = $("<strong></strong");
    strong1.text("Jugador");
    let col2 = $("<td></td>")
    let strong2 = $("<strong></strong");
    strong2.text("Nº Cartas");
    col1.append(strong1);
    fila.append(col1);
    col2.append(strong2);
    fila.append(col2);
    padre.append(fila);
}
//Establece la tabla del juego
function createGameTable(players, cards, turn) {
    let superPadre = $("#tabla");
    superPadre.empty();
    setTableHeader();
    if (turn) { //Si hay partida empezada
        for (let i = 0; i < players.length; i++) {
            let padre = $("<tr></tr>");
            let name = $("<td></td>");
            name.text(players[i]);
            name.addClass(players[i]);
            name.addClass("name");
            let numCards = $("<td></td>");
            numCards.text(cards[i]);
            numCards.addClass(players[i]);
            numCards.addClass("numCards");
            padre.append(name);
            padre.append(numCards);
            superPadre.append(padre);
            if (players[i] === turn) {
                $(name).addClass("bg-success");
                $(numCards).addClass("bg-success");
            }
        }
    }
    else {
        for (let i = 0; i < 4; i++) {
            let padre = $("<tr></tr>");
            let name = $("<td></td>");
            name.text(players[i]);
            let numCards = $("<td></td>");
            numCards.text("...");
            padre.append(name);
            padre.append(numCards);
            superPadre.append(padre);
        }
    }
}
//Actualiza la tabla cambiando la fila verde y modificando los valores
function updateGamePlayersTable(newTurn, difference) {
    let text = Number($("." + getPlayerName() + ".numCards").text());
    $("." + getPlayerName() + ".numCards").text(text - difference);
    $("td").removeClass("bg-success");
    $("."+newTurn).addClass("bg-success");
}

//Comprueba si la partida está completa y si no lo está muestra el mensaje de que no está completa
function checkIfComplete(players) {
    $("#notComplete").hide();
    if (players.names) {
        $("#notComplete").show();
        return false;
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
function newGame(id, name, callback) {
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

function joinGame(gameId, id, callback) {
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
            callback({ error: data.responseJSON.error });
        }
    });
}

//getGameStatus: devuelve el estado de una partida
function getGameStatus(actualMatch, callback) {
    $.ajax({
        type: "GET",
        url: "/status/" + actualMatch + "/" + getPlayerName(),
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
        error: function (data, textStatus, jqXHR) {
            callback(null);
        }
    });
}


function playerMovesQuery(cards, number) {
    $.ajax({
        type: "PUT",
        url: "/action",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        data: JSON.stringify({ cards: cards, number: number, id: getGameId() }),
        contentType: "application/json",
    });
}

function checkIfLiar(callback) {
    $.ajax({
        type: "PUT",
        url: "/isLiar",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        data: JSON.stringify({ id: getGameId() }),
        contentType: "application/json",
        success: function (data, textStatus, jqXHR) {
            callback(data);
        },
    });
}

function discardCards(callback){
    $.ajax({
        type: "PUT",
        url: "/discard",
        beforeSend: function (req) {
            req.setRequestHeader("Authorization", "Basic " + cadenaBase64);
        },
        data: JSON.stringify({ id: getGameId(), player: getPlayerName() }),
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
            callback(data.discard);
        }
    })
}


////////// FIN AJAX //////////




//UTILIDADES JUEGO

function showMyCards(cards) {
    let padre = $("#cartasUsr");
    padre.empty();
    if(cards === "NULL"){ //Jugador con 0 cartas
        let parrafo = $("<p></p>");
        parrafo.text("No tienes cartas, esperando al siguiente jugador.");
        padre.append(parrafo);
    }
    else{
        cards.forEach(element => {
            let elem = $("<img></img>");
            let img = getCardImgByName(element);
            elem.prop("src", img);
            elem.addClass("card");
            elem.on("click", function (event) {
                if ($(this).hasClass("selectedCard")) {
                    $(this).removeClass("selectedCard")
                }
                else
                    $(this).addClass("selectedCard")
            });
            padre.append(elem);
        });
    }
}

function showTableCards(tableCards) {
    $("#cardsTab").empty();
    tableCards.forEach(card => {
        let elem = $("<img></img>");
        let src = getCardImgByName(card);
        elem.prop("src", src);
        $("#cardsTab").append(elem);
    });

}

function getCardImgByName(name) {
    let res = "";
    switch (name) {
        case "AS de Corazones": res = ".//img/A_H.png"; break;
        case "AS de Diamantes": res = ".//img/A_D.png"; break;
        case "AS de Picas": res = ".//img/A_S.png"; break;
        case "AS de Tréboles": res = ".//img/A_C.png"; break;
        case "2 de Corazones": res = ".//img/2_H.png"; break;
        case "2 de Diamantes": res = ".//img/2_D.png"; break;
        case "2 de Picas": res = ".//img/2_S.png"; break;
        case "2 de Tréboles": res = ".//img/2_C.png"; break;
        case "3 de Corazones": res = ".//img/3_H.png"; break;
        case "3 de Diamantes": res = ".//img/3_D.png"; break;
        case "3 de Picas": res = ".//img/3_S.png"; break;
        case "3 de Tréboles": res = ".//img/3_C.png"; break;
        case "4 de Corazones": res = ".//img/4_H.png"; break;
        case "4 de Diamantes": res = ".//img/4_D.png"; break;
        case "4 de Picas": res = ".//img/4_S.png"; break;
        case "4 de Tréboles": res = ".//img/4_C.png"; break;
        case "5 de Corazones": res = ".//img/5_H.png"; break;
        case "5 de Diamantes": res = ".//img/5_D.png"; break;
        case "5 de Picas": res = ".//img/5_S.png"; break;
        case "5 de Tréboles": res = ".//img/5_C.png"; break;
        case "6 de Corazones": res = ".//img/6_H.png"; break;
        case "6 de Diamantes": res = ".//img/6_D.png"; break;
        case "6 de Picas": res = ".//img/6_S.png"; break;
        case "6 de Tréboles": res = ".//img/6_C.png"; break;
        case "7 de Corazones": res = ".//img/7_H.png"; break;
        case "7 de Diamantes": res = ".//img/7_D.png"; break;
        case "7 de Picas": res = ".//img/7_S.png"; break;
        case "7 de Tréboles": res = ".//img/7_C.png"; break;
        case "8 de Corazones": res = ".//img/8_H.png"; break;
        case "8 de Diamantes": res = ".//img/8_D.png"; break;
        case "8 de Picas": res = ".//img/8_S.png"; break;
        case "8 de Tréboles": res = ".//img/8_C.png"; break;
        case "9 de Corazones": res = ".//img/9_H.png"; break;
        case "9 de Diamantes": res = ".//img/9_D.png"; break;
        case "9 de Picas": res = ".//img/9_S.png"; break;
        case "9 de Tréboles": res = ".//img/9_C.png"; break;
        case "10 de Corazones": res = ".//img/10_H.png"; break;
        case "10 de Diamantes": res = ".//img/10_D.png"; break;
        case "10 de Picas": res = ".//img/10_S.png"; break;
        case "10 de Tréboles": res = ".//img/10_C.png"; break;
        case "J de Corazones": res = ".//img/J_H.png"; break;
        case "J de Diamantes": res = ".//img/J_D.png"; break;
        case "J de Picas": res = ".//img/J_S.png"; break;
        case "J de Tréboles": res = ".//img/J_C.png"; break;
        case "Q de Corazones": res = ".//img/Q_H.png"; break;
        case "Q de Diamantes": res = ".//img/Q_D.png"; break;
        case "Q de Picas": res = ".//img/Q_S.png"; break;
        case "Q de Tréboles": res = ".//img/Q_C.png"; break;
        case "K de Corazones": res = ".//img/K_H.png"; break;
        case "K de Diamantes": res = ".//img/K_D.png"; break;
        case "K de Picas": res = ".//img/K_S.png"; break;
        case "K de Tréboles": res = ".//img/K_C.png"; break;
    }
    return res;
}

function getCardByImg(img) {
    let card = "";
    switch (img) {
        case ".//img/A_H.png": card = "AS de Corazones"; break;
        case ".//img/A_D.png": card = "AS de Diamantes"; break;
        case ".//img/A_S.png": card = "AS de Picas"; break;
        case ".//img/A_C.png": card = "AS de Tréboles"; break;
        case ".//img/2_H.png": card = "2 de Corazones"; break;
        case ".//img/2_D.png": card = "2 de Diamantes"; break;
        case ".//img/2_S.png": card = "2 de Picas"; break;
        case ".//img/2_C.png": card = "2 de Tréboles"; break;
        case ".//img/3_H.png": card = "3 de Corazones"; break;
        case ".//img/3_D.png": card = "3 de Diamantes"; break;
        case ".//img/3_S.png": card = "3 de Picas"; break;
        case ".//img/3_C.png": card = "3 de Tréboles"; break;
        case ".//img/4_H.png": card = "4 de Corazones"; break;
        case ".//img/4_D.png": card = "4 de Diamantes"; break;
        case ".//img/4_S.png": card = "4 de Picas"; break;
        case ".//img/4_C.png": card = "4 de Tréboles"; break;
        case ".//img/5_H.png": card = "5 de Corazones"; break;
        case ".//img/5_D.png": card = "5 de Diamantes"; break;
        case ".//img/5_S.png": card = "5 de Picas"; break;
        case ".//img/5_C.png": card = "5 de Tréboles"; break;
        case ".//img/6_H.png": card = "6 de Corazones"; break;
        case ".//img/6_D.png": card = "6 de Diamantes"; break;
        case ".//img/6_S.png": card = "6 de Picas"; break;
        case ".//img/6_C.png": card = "6 de Tréboles"; break;
        case ".//img/7_H.png": card = "7 de Corazones"; break;
        case ".//img/7_D.png": card = "7 de Diamantes"; break;
        case ".//img/7_S.png": card = "7 de Picas"; break;
        case ".//img/7_C.png": card = "7 de Tréboles"; break;
        case ".//img/8_H.png": card = "8 de Corazones"; break;
        case ".//img/8_D.png": card = "8 de Diamantes"; break;
        case ".//img/8_S.png": card = "8 de Picas"; break;
        case ".//img/8_C.png": card = "8 de Tréboles"; break;
        case ".//img/9_H.png": card = "9 de Corazones"; break;
        case ".//img/9_D.png": card = "9 de Diamantes"; break;
        case ".//img/9_S.png": card = "9 de Picas"; break;
        case ".//img/9_C.png": card = "9 de Tréboles"; break;
        case ".//img/10_H.png": card = "10 de Corazones"; break;
        case ".//img/10_D.png": card = "10 de Diamantes"; break;
        case ".//img/10_S.png": card = "10 de Picas"; break;
        case ".//img/10_C.png": card = "10 de Tréboles"; break;
        case ".//img/J_H.png": card = "J de Corazones"; break;
        case ".//img/J_D.png": card = "J de Diamantes"; break;
        case ".//img/J_S.png": card = "J de Picas"; break;
        case ".//img/J_C.png": card = "J de Tréboles"; break;
        case ".//img/Q_H.png": card = "Q de Corazones"; break;
        case ".//img/Q_D.png": card = "Q de Diamantes"; break;
        case ".//img/Q_S.png": card = "Q de Picas"; break;
        case ".//img/Q_C.png": card = "Q de Tréboles"; break;
        case ".//img/K_H.png": card = "K de Corazones"; break;
        case ".//img/K_D.png": card = "K de Diamantes"; break;
        case ".//img/K_S.png": card = "K de Picas"; break;
        case ".//img/K_C.png": card = "K de Tréboles"; break;
    }
    return card;
}


function getPlayerName() {
    return $("#name").text();
}

function getGameId() {
    return Number($("#menuSup > .active").attr("id"));
}