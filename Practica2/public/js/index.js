"use strict";
$(()=> {
    showLogin();
    $("#loginBtns").on("click", "button#registerBtn", onRegisterButtonClick);
    $("#loginBtns").on("click", "button#loginBtn", onLoginButtonClick);
});

function showLogin(){
    $("#signIn").show();
}
function hideLogin(){
    $("#signIn").hide();
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
            alert("Se ha producido un error");
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
            console.log("SUCCESS"); //Continuará
        },
        error: function (data, textStatus, jqXHR) {
            alert("Usuario y/o contraseña no válido");
        }
    });
}



