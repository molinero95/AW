El proyecto inicializarlo con npm init
Los paquetes de js instalarlos con npm install paquete --save

MYSQL:
Pool de conexiones: host, user, password(vacia por defecto), database(nombre) creamos el objeto pool y hacemos un getConnection((err, connection)=>{ ... })