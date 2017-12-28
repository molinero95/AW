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
    $.ajax({
        type:"POST",
        url: "/register",
        success: function(data, textStatus, jqXHR) {
            alert("YUJU");
        },
        error: function (data, textStatus, jqXHR) {
            alert("Se ha producido un error: " + errorThrown);
        }
    });
}
//Esto no llega a el servidor
function onLoginButtonClick(event) {
    $.ajax({
        type:"POST",
        url: "/login",
        contentType: "application/json",
        data: JSON.stringify({ user: inputLogin, pass: inputPassword }),//terminar
        success: function(data, textStatus, jqXHR) {
            alert("logueado");
        },
        error: function (data, textStatus, jqXHR) {
            alert("Se ha producido un error: " + errorThrown);
        }
    });
    
}



