COSAS POR HACER:
    Importante: siempre vamos a tener un juego en el html. El id es #game
    Al seleccionar una pestaña lo único que haremos será modificar los elementos del div game, no vamos a crear otra.
    Es decir: click en la pestaña prueba, pues se establecen todos los atributos del div game para esa partida. Ahora click en
    la partida pepito, pues se estableceran los elementos para la partida pepito.


    - Probar bien joinGame

    - HTML para cada partida, modificando atributos como he puesto en "Importante"
    - get /status comprobar si funciona. Recomendación: hacer despues del punto anterior.
    - Boton logout
    - El id del usuario esta en el request, no hace falta devolverlo en la consulta que se hace en el login

POR HACER:
    - En index.js, cuando vayamos a crear un nodo para el DOM cuidado con let x = "<div>..."; utilizar
let x = $("<div>...</div>); y añadir cosas a parte. Cambiar AddToNav