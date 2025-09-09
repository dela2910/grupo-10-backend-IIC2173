# 2025-2 / IIC2173 - E0 | Properties Market Async

# 1. Nombre del dominio
http://propertyreservepuc.tech/properties

Considerar que es http y no https

# 2. Método de acceso al servidor con archivo .pem y ssh (no publicar estas credenciales en el repositorio).
Incluidas en la entrega de Canvas.

# 3. Puntos logrados o no logrados y comentarios si son necesarios para cada aspecto a evaluar en la Parte mínima y en la Parte variable.
- Requisitos funcionales (10 pts): Realizado completo
- Requisitos no funcionales (20 pts): Realizado completo
- Docker Compose (15 pts): Realizado completo
- Variable (15 pts):  Se realizó por completo el balanceo de carga con Nginx


# 4. De realizar un tercer requisito variable también explicitar en el readme.
No realizado.

# 5. Consideraciones generales
## Acerca de la API
Esta se encuentra en la siguiente URL: http://propertyreservepuc.tech/properties y expone los endpoints GET pedidos en enunciado:
1. properties/ : devuelve lista de propiedades páginadas y filtradas por los query params descritos más adelante. Llegan en formato JSON con solo los siguientes atributos: 'id', 'name', 'visits_available', 'price', 'location', 'timestamp', 'currency'.
2. properties/{id} : devuelve en un JSON todos los atributos de la propiedad a la que corresponde este {id}.

Los query parameters de (1) son:
1. page: define que a qué página se accede, y si no quedan más elementos simplemente trae JSON vacío. Por defecto es 1.
2. limit: número de propiedas traídas por paginación. Por defecto es 25.
3. price: filtrar propiedades con precio menor a este. Por defecto se buscan precios de todos los tipos de moneda, se puede modificar esto con parámetro currency.
4. location: busca coincidencia case insensitive y sin ver tildes de este parametro en tabla.
5. date: buscar coincidencia de fecha exacta este parámetro en formato AAAA-MM-DD.
6. currency: definir con que tipo de moneda se evalua parámetro price, debe indicarlo correctamente sin importar mayúsculas ("uf" o "UF" es lo mismo) pues si se ingresa uno inválido, e.g. "usd", entonces la búsqueda no devuelve nada.

## Acerca de la base de datos
Solamente la API puede interactuar con esta y recibe las propiedades desde el suscriber a través de solicitudes POST con toda la información necesaria. Está compuesta de solo una tabla Properties la cual almacena todas las propiedades, esta además de los parámetros entregados por el broker y los que tiene por defecto sequelize (por ej. hora de última actualización) contiene el atributo "reserved_visits" el cual lleva la cuenta de cuantas propiedades repetidas han llegado. Una propiedad es repetida si tiene todos los parámetros que la definen como reserva iguales a una anterior, es este caso esos atributos son:    name, price, currency, bedrooms, bathrooms, m2, location, img, url y is_project. Si alguno de estos es diferente se considera como tal y se agrega como nueva reserva.

## Acerca de Docker
El detalle de cómo se construyen los contenedores está en el archivo docker-compose.yml, básicamente se arman 4 containers: 1 para la base de datos, 1 para el suscriber y 2 para la API (realizando balanceo de carga entre estos). Los puertos expuestos en EC2 de los contenedores API son 5000 y 5001 que después son usados por Nginx. 
Se construye una internal network bridge para permitir a suscriber realizar solicitudes a través de esta a la API, por defecto esta solo las realiza a la app1 y no pasa por el balanceo de carga de Nginx.
Tanto la app como el suscriber tienen su dockerfile en su directorio mientras que la base de datos solo trae una imágen de postgres.

## Acerca de AWS
Esta tiene una ip elástica: 3.129.192.68 en caso de no funcionar dominio. Lleva encendida desde aproximadamente el 26 de agosto recibiendo propiedades. Todo lo que está en este github se llevó a la instancia de EC2 clonándolo. Los .env se crearon allí mismo para no subirlos.

## Acerca de Nginx
Como se mencionó antes se realizo esta parte variable. El como funciona el proxy de Nginx está configurado por el archivo nginx.config el cual se encuentra en este repositorio (como .txt para no dar conflictos en el deployment) y en la siguiente ubicación de EC2: /etc/nginx/nginx.conf pues allí es dónde se crea por defecto. Lo que configura el proxy inverso es el siguiente extracto de allí:
```
http {
    upstream docker-containers {
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
    }
server {
        listen 80;
        server_name _;

        location / {
        proxy_pass http://docker-containers;
    }
}
}

```
Se detalla que los contenedores que se distribuirán la carga son las apps levantadas en localhost en los puertos 5000 y 5001 nombradas docker-containers. El proxy se pone a escuchar en el puerto por defecto de http: 80. Redirige cualquier ruta con location / a donde se definió antes. Se usa server_name _ para que haga coincidencia con cualquier tráfico que llegue a la instancia y no haya problemas con algun otro .config que esté por allí.