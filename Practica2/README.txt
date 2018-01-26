POR HACER:
    - En index.js, cuando vayamos a crear un nodo para el DOM cuidado con let x = "<div>..."; utilizar
let x = $("<div>...</div>); y añadir cosas a parte. Cambiar AddToNav
    - Cuando vamos a obtener la carta por su imagen cuidado, hacerlo con la URL entera.
    - Boton mentiroso
    - Cuando alguien se quede sin cartas y el siguiente pulse mentiroso ahi puede terminar el juego, si no pulsa mentiroso gana el anterior


FALLOS:
    - Si en la primera jugada de la partida selecciono cartas sin marcar los numeritos de abajo o marcando más de uno, desaparecen las cartas
    pero no se altera el estado de la partida. Si salgo y vuelvo a entrar se cambian las cartas por otras para tener 13 de nuevo (creo)
    y no me deja jugar
