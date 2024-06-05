
Proyecto final - StreamWave (BackEnd)  
Desarrollo de servicios web  
Instituto Recnologico de Tepic

# Integrantes
- Guzmán Álvarez Jorge Alberto - 20400751
- Inzunsa Diaz Cesar Alejandro - 19400595
- Rodriguez Godinez Alan Daniel - 20400812
- Zuñiga Lopez Brandon Jesus - 20400844 

# Introducción
Este sistema se creo en base a nuestra propuesta la cual fue crear un servicios de streaming de peliculas, en este sistema los usuarios pueden registrarse e iniciar sesión para entrar a ver las peliculas dependiendo del tipo de paquete que se haya seleccionado.
Otro tipo de usuario que puede interactuar en este sistema son los administradores, como administrador tienes la posibilidad de agregar, modificar o eliminar clientes o peliculas segun lo que se vea necesario.
Las peliculas consisten en su titulo, descripcion, imagen, trailer, categoria y paquete.

De manera general nuestro objetivo fue poner en prueba todo lo que hemos aprendido en la materia por lo que utilizaremos GraphQL haciendo uso de las consultas, mutaciones y suscripciones.

A traves de este documento nos centraremos en el backend y mostraremos las diversas operaciones que pueden realizar nuestro sistema y como consumir las API de manera efectiva.

Cabe mencionar que nuestro proyecto esta conectado a una base de datos en mongo Atlas el cual su conexion es establecida en el archivo src/db.js

# Usuario de tipo ADMIN de prueba para utilizar en la apk
- Usuario: cesar@streamwave.com
- Contraseña: admin123

# Usuario de tipo USER de prueba para utilizar en la apk
Usuario 1 con paquete PREMIUM
- Usuario: juanito@example.com
- Contraseña: 123456
- Paquete: PREMIUM

Usuario 2 con paquete BASICO  
- Usuario: example@example.com
- Contraseña: admin123

# APIs

Todas las APIs fueron desarrolladas en graphQL

## Querys
### getAllMovies
Obtener todas las películas agregadas en la base de datos

Esta petición retorna la información deseada sobre todas las películas que estén agregadas en la base de datos.

| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Categoría de la película                                         |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo                |
| description         | String  | Sinopsis de la película                                          |
| id                  | ID      | ID generado de la película                                       |
| imageUrl            | String  | URL de la portada de la película                                 |
| subscriptionPackage | String  | Nombre del paquete/suscripción                                   |
| title               | String  | Título de la película                                            |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) |

Los campos son, por decirlo de alguna manera, los filtros; la información que se nos retorne tendrá que ver con los campos seleccionados.

```graphql
query ExampleQuery {
  getAllMovies {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```

### getAllMoviesBySubscription
Obtener todas las películas por suscripción

Esta petición retorna la información de las películas que se pueden ver dependiendo de la suscripción o paquete elegido (BASICO|ESTANDAR|PREMIUM).

#### Variables:
| Campo                | Tipo    | Descripción                        |
|----------------------|---------|------------------------------------|
| subscriptionPackage  | String  | Nombre del paquete/suscripción (obligatorio) |

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Categoría de la película                                         |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo                |
| description         | String  | Sinopsis de la película                                          |
| id                  | ID      | ID generado de la película                                       |
| imageUrl            | String  | URL de la portada de la película                                 |
| subscriptionPackage | String  | Nombre del paquete/suscripción                                   |
| title               | String  | Título de la película                                            |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) |

En cuanto a los campos, se puede observar que ninguno es obligatorio ya que sirven como filtro para la información que se desea retornar. Sin embargo, es necesario seleccionar al menos uno para que retorne la información.

En cuanto a las variables, nos referimos a un parámetro que es necesario insertar un valor para que funcione. En este caso, al ser uno de los paquetes, solo se aceptan los valores "BASICO", "ESTANDAR" y "PREMIUM".

Ejemplo de uso:
```graphql
query GetAllMoviesBySubscription($subscriptionPackage: String!) {
  getAllMoviesBySubscription(subscriptionPackage: $subscriptionPackage) {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```
```graphql
{
  "subscriptionPackage": "BASICO"
}
```

### getMoviesByCategory
Obtener todas las películas por categoría

Esta petición retorna la información de todas las películas tanto por su categoría así como el paquete seleccionado.

#### Variables:
| Campo                | Tipo    | Descripción                        |
|----------------------|---------|------------------------------------|
| subscriptionPackage  | String  | Nombre del paquete/suscripción (obligatorio) |
| category             | String  | Categoría de las películas (obligatorio)     |

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Categoría de la película                                         |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo                |
| description         | String  | Sinopsis de la película                                          |
| id                  | ID      | ID generado de la película                                       |
| imageUrl            | String  | URL de la portada de la película                                 |
| subscriptionPackage | String  | Nombre del paquete/suscripción                                   |
| title               | String  | Título de la película                                            |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) |

Igual que en las querys anteriores, las variables son parámetros obligatorios. En este caso, son dos los que se deben insertar para que funcione correctamente: el paquete puede ser "BASICO", "ESTANDAR" o "PREMIUM" mientras que la categoría puede ser "Drama", "Terror", "Acción", "Comedia" o "Crimen". Los campos son la información que se desea retornar.

Ejemplo de uso:
```graphql
query GetMoviesByCategory($category: String!, $subscriptionPackage: String!) {
  getMoviesByCategory(
    category: $category
    subscriptionPackage: $subscriptionPackage
  ) {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}

```
```graphql
{
  "category": "Drama",
  "subscriptionPackage": "BASICO"
}
```


### getMovieById
Obtener película por su ID

Esta petición retorna la información de una película en específico la cual debe ser seleccionada mediante su ID.

#### Variables:
| Campo  | Tipo | Descripción                    |
|--------|------|--------------------------------|
| id     | ID   | ID generado de la película (obligatorio) |

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Categoría de la película                                         |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo                |
| description         | String  | Sinopsis de la película                                          |
| id                  | ID      | ID generado de la película                                       |
| imageUrl            | String  | URL de la portada de la película                                 |
| subscriptionPackage | String  | Nombre del paquete/suscripción                                   |
| title               | String  | Título de la película                                            |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) |

En este caso, el parámetro es el ID de la película, el cual es generado automáticamente por el programa.

Al ser una película, todos los campos son los mismos que en las querys anteriores.

Ejemplo de uso:
```graphql
query GetMovieById($getMovieByIdId: ID!) {
  getMovieById(id: $getMovieByIdId) {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```
```graphql
{
  "getMovieByIdId": "664f6087faaecebf48c14982"
}
```

### getAllUsers
Obtener todos los usuarios

Esta petición retorna la información deseada de todos los usuarios registrados en la base de datos.

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | ID generado del usuario                                          |
| name                | String  | Nombre del usuario                                               |
| email               | String  | Correo electrónico del usuario                                   |
| password            | String  | Contraseña del usuario                                           |
| subscriptionPackage | String  | Nombre del paquete seleccionado por el usuario                   |
| type                | String  | Tipo de usuario, ya sea "usuario" o "administrador"              |
| createdAt           | String  | Fecha en la que se creó el usuario                               |

Esta petición no requiere de parámetros. Sin embargo, al ser otro modelo, sus campos son diferentes, aunque sigue funcionando igual que las demás.

```graphql
query GetAllUsers {
  getAllUsers {
    id
    name
    email
    password
    subscriptionPackage
    type
    createdAt
  }
}
```


### getUserById
Obtener usuario por ID

Esta petición retorna la información deseada de algún usuario en específico mediante su ID.

#### Variables:
| Campo | Tipo | Descripción                    |
|-------|------|--------------------------------|
| id    | ID   | ID generado del usuario (obligatorio) |

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | ID del usuario                                                   |
| name                | String  | Nombre del usuario                                               |
| email               | String  | Correo electrónico del usuario                                   |
| password            | String  | Contraseña del usuario                                           |
| subscriptionPackage | String  | Nombre del paquete seleccionado por el usuario                   |
| type                | String  | Tipo de usuario, ya sea "usuario" o "administrador"              |
| createdAt           | String  | Fecha en la que se creó el usuario                               |

Esta petición solo cambia en que se necesita un parámetro, el cual es el ID del usuario.

Ejemplo de uso:
```graphql
query GetUserById($getUserByIdId: ID!) {
  getUserById(id: $getUserByIdId) {
    id
    name
    email
    password
    subscriptionPackage
    type
    createdAt
  }
}
```

```graphql
{
  "getUserByIdId": "664ed3cd95483ab7d17fea91"
}
```

## Mutations
### createMovie
Crear una película

En esta mutación se creará una película y se agregará a la base de datos al insertar los datos correspondientes.

#### Argumentos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| title               | String  | Título de la película (obligatorio)                              |
| description         | String  | Sinopsis de la película (obligatorio)                            |
| category            | String  | Categoría de la película (obligatorio)                           |
| subscriptionPackage | String  | Paquete al que será añadida la película (obligatorio)            |
| imageUrl            | String  | URL de la imagen que se utilizará como portada de la película (obligatorio) |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) (obligatorio) |

Al ser una mutación en la cual se agrega una nueva película, todos los parámetros son necesarios para su funcionalidad. En caso de que no se agregue información en alguno de los campos, se mostrará un error ya que no se permiten campos vacíos.

#### Ejemplo de uso:
```graphql
mutation CreateMovie(
  $title: String!
  $description: String!
  $category: String!
  $subscriptionPackage: String!
  $imageUrl: String!
  $trailerUrl: String!
) {
  createMovie(
    title: $title
    description: $description
    category: $category
    subscriptionPackage: $subscriptionPackage
    imageUrl: $imageUrl
    trailerUrl: $trailerUrl
  )
}

```
```graphql
{
  "title": "Godzilla: King of the Monsters",
  "description": "sinopsis",
  "category": "Sci fi",
  "subscriptionPackage": "PREMIUM",
  "imageUrl": "https://i.etsystatic.com/15375993/r/il/840302/1903068907/il_570xN.1903068907_ngnz.jpg",
  "trailerUrl": "yKhiEJvrb0c"
}
```

### createUser
Crear un usuario

En esta mutación se creará un usuario el cual será agregado a la base de datos después de insertar toda la información necesaria.

#### Argumentos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| name                | String  | Nombre del usuario (obligatorio)                                 |
| email               | String  | Correo electrónico del usuario (obligatorio)                     |
| password            | String  | Contraseña del usuario (obligatorio)                             |
| type                | String  | Tipo de usuario, ya sea "USER" o "ADMIN" (obligatorio)           |
| subscriptionPackage | String  | El nombre del paquete que el usuario haya seleccionado           |

Esta mutación agrega un nuevo usuario a la base de datos, por lo que todos los parámetros son obligatorios para su correcto funcionamiento. Esta mutación no acepta campos vacíos, por lo que mostrará un error en caso de que no encuentre información registrada.

#### Ejemplo de uso:
```graphql
mutation CreateUser(
  $name: String!
  $email: String!
  $password: String!
  $type: String!
  $subscriptionPackage: String!
) {
  createUser(
    name: $name
    email: $email
    password: $password
    type: $type
    subscriptionPackage: $subscriptionPackage
  )
}

```
```graphql
{
  "name": "PepeSuej",
  "email": "correo10@gmail.com",
  "password": "cotra1234",
  "type": "USER",
  "subscriptionPackage": "ESTANDAR"
}
```

### deleteMovie
Borrar una película

Esta mutación elimina una película de la base de datos mediante su ID.

#### Argumentos:
| Campo | Tipo | Descripción                    |
|-------|------|--------------------------------|
| id    | ID   | ID generado de la película (obligatorio) |

Esta mutación solamente requiere de un parámetro, el cual es el ID, ya que en este caso es la forma más sencilla de encontrar una película y así mismo eliminar toda la información de la misma.

#### Ejemplo de uso:
```graphql
mutation DeleteMovie($deleteMovieId: ID!) {
  deleteMovie(id: $deleteMovieId)
}
```
```graphql
{
  "deleteMovieId": "664f6087faaecebf48c14982"
}
```

### deleteUser
Borrar un usuario

Esta mutación elimina un usuario de la base de datos mediante su ID.

#### Argumentos:
| Campo | Tipo | Descripción                    |
|-------|------|--------------------------------|
| id    | ID   | ID generado del usuario (obligatorio) |

Igualmente, al ser una eliminación, solamente se requiere de la ID del usuario para ser encontrado y después eliminado de la base de datos.

#### Ejemplo de uso:
```graphql
mutation DeleteUser($deleteUserId: ID!) {
  deleteUser(id: $deleteUserId)
}
```
```graphql
{
  "deleteUserId": "664ed3cd95483ab7d17fea91"
}
```

### updateMovie
Modificar una película

Esta mutación nos permite actualizar los datos de una película en específico mediante su ID.

#### Argumentos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | ID generado de la película (obligatorio)                         |
| category            | String  | Categoría de la película (obligatorio)                           |
| description         | String  | Sinopsis de la película (obligatorio)                            |
| imageUrl            | String  | URL de la portada de la película (obligatorio)                   |
| subscriptionPackage | String  | Nombre del paquete/suscripción (obligatorio)                     |
| title               | String  | Título de la película (obligatorio)                              |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube (ej. abc123) (obligatorio) |

Esta petición nos da la posibilidad de modificar los datos de una película en específico en caso de que se requiera, comúnmente por un error. Esta mutación también requiere de todos los campos mencionados anteriormente para su correcto funcionamiento.

#### Ejemplo de uso:
```graphql
mutation UpdateMovie(
  $updateMovieId: ID!
  $title: String!
  $description: String!
  $category: String!
  $subscriptionPackage: String!
  $imageUrl: String!
  $trailerUrl: String!
) {
  updateMovie(
    id: $updateMovieId
    title: $title
    description: $description
    category: $category
    subscriptionPackage: $subscriptionPackage
    imageUrl: $imageUrl
    trailerUrl: $trailerUrl
  )
}
```
```graphql
{
  "updateMovieId": "664f6108faaecebf48c1498a",
  "title": "Annabelle",
  "description": "Descripción actualizada",
  "category": "Terror",
  "subscriptionPackage": "ESTANDAR",
  "imageUrl": "url",
  "trailerUrl": "abc123"
}
```

### updateUser
Actualizar usuario

Esta mutación permite modificar los datos de un usuario registrado en la base de datos mediante su ID.

#### Argumentos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | ID del usuario (obligatorio)                                     |
| name                | String  | Nombre del usuario (obligatorio)                                 |
| email               | String  | Correo electrónico del usuario (obligatorio)                     |
| password            | String  | Contraseña del usuario (obligatorio)                             |
| subscriptionPackage | String  | Nombre del paquete seleccionado por el usuario (obligatorio)     |

Esta petición nos permite modificar la información asociada a un usuario en específico mediante su ID. Requiere de todos los campos mencionados anteriormente para funcionar correctamente.

#### Ejemplo de uso:
```graphql
mutation UpdateUser(
  $updateUserId: ID!
  $name: String!
  $email: String!
  $password: String!
  $subscriptionPackage: String!
) {
  updateUser(
    id: $updateUserId
    name: $name
    email: $email
    password: $password
    subscriptionPackage: $subscriptionPackage
  )
}
```
```graphql
{
  "updateUserId": "664ed3cd95483ab7d17fea91",
  "name": "BrandonZ",
  "email": "example1@example.com",
  "password": "pass123",
  "subscriptionPackage": "PREMIUM"
}
```


### login
Iniciar sesión

Esta petición permite al usuario iniciar sesión en el sistema.

#### Argumentos:
| Campo   | Tipo    | Descripción                                |
|---------|---------|--------------------------------------------|
| email   | String  | Correo electrónico del usuario (obligatorio) |
| password| String  | Contraseña del usuario (obligatorio)      |

Al agregar los datos, nuestro sistema retornará la información del usuario. Sin embargo, la información será encriptada para una mayor seguridad.

#### Ejemplo de uso:
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    ... on User {
      id
      name
      email
      password
      subscriptionPackage
      type
      createdAt
    }
    ... on LoginError {
      success
      message
    }
  }
}
```
```graphql
{
  "email": "example@example.com",
  "password": "admin123"
}
```

## Subscriptions

Nota: Todas las suscripciones se deben iniciar antes que las querys/mutaciones para mostrar el resultado

### movieAdded, basicMovieAdded, standardMovieAdded, premiumMovieAdded

Estas suscripciones mostraran el estado del servidor de suscripciones cuando se añada una pelicula nueva.
Basicamente todas estas suscripciones funcionan igual, la diferencia radica en que tipo de paquete esta incluida la pelicula se mostrara, la primera suscripccion "movieAdded" mostrara todas las peliculas sin importar el paquete, sin embargo "basicMovieAdded", "standardMovieAdded", y "premiumMovieAdded" mostrara las peliculas agregadas a los paquetes "BASICO", "ESTANDAR" y "PREMIUM" respectivamente.


### movieAdded
Esta suscripción muestra el estado del servidor de suscripciones cuando se añade una nueva película.

#### Campos:
| Campo               | Tipo    | Descripción                                            |
|---------------------|---------|--------------------------------------------------------|
| category            | String  | Categoría de la película                               |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo      |
| description         | String  | Sinopsis de la película                                |
| id                  | ID      | ID generado de la película                             |
| imageUrl            | String  | URL de la portada de la película                       |
| subscriptionPackage | String  | Nombre del paquete/suscripción de la película          |
| title               | String  | Título de la película                                  |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube    |

```graphql
subscription MovieAdded {
  movieAdded {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```

Esta suscripción es útil para mantener a los clientes actualizados cuando se añade una nueva película al sistema.

### userAdded
Esta suscripción muestra el estado del servidor de suscripciones cuando se añade un nuevo usuario.

#### Campos:
| Campo               | Tipo    | Descripción                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | ID del usuario                                                   |
| name                | String  | Nombre del usuario                                               |
| email               | String  | Correo electrónico del usuario                                   |
| password            | String  | Contraseña del usuario                                           |
| subscriptionPackage | String  | Nombre del paquete seleccionado por el usuario                   |
| type                | String  | Tipo de usuario (usuario o administrador)                        |
| createdAt           | String  | Fecha en la que se creó el usuario                               |

```graphql
subscription UserAdded {
  userAdded {
    id
    name
    email
    password
    subscriptionPackage
    type
    createdAt
  }
}
```

Esta suscripción es útil para mantener a los clientes actualizados cuando se añade un nuevo usuario al sistema.


### BasicMovieAdded
Esta suscripción muestra el estado del servidor de suscripciones cuando se añade una nueva película al paquete básico.

#### Campos:
| Campo               | Tipo    | Descripción                                            |
|---------------------|---------|--------------------------------------------------------|
| category            | String  | Categoría de la película                               |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo      |
| description         | String  | Sinopsis de la película                                |
| id                  | ID      | ID generado de la película                             |
| imageUrl            | String  | URL de la portada de la película                       |
| subscriptionPackage | String  | Nombre del paquete/suscripción de la película          |
| title               | String  | Título de la película                                  |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube    |

```graphql
subscription BasicMovieAdded {
  basicMovieAdded {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```

Esta suscripción es útil para mantener a los clientes actualizados cuando se añade una nueva película al paquete básico.

### StandardMovieAdded
Esta suscripción muestra el estado del servidor de suscripciones cuando se añade una nueva película al paquete estándar.

#### Campos:
| Campo               | Tipo    | Descripción                                            |
|---------------------|---------|--------------------------------------------------------|
| category            | String  | Categoría de la película                               |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo      |
| description         | String  | Sinopsis de la película                                |
| id                  | ID      | ID generado de la película                             |
| imageUrl            | String  | URL de la portada de la película                       |
| subscriptionPackage | String  | Nombre del paquete/suscripción de la película          |
| title               | String  | Título de la película                                  |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube    |

```graphql
subscription StandardMovieAdded {
  standardMovieAdded {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```

Esta suscripción es útil para mantener a los clientes actualizados cuando se añade una nueva película al paquete estándar.

### PremiumMovieAdded
Esta suscripción muestra el estado del servidor de suscripciones cuando se añade una nueva película al paquete premium.

#### Campos:
| Campo               | Tipo    | Descripción                                            |
|---------------------|---------|--------------------------------------------------------|
| category            | String  | Categoría de la película                               |
| createdAt           | String  | Fecha en la que se agregó la película al catálogo      |
| description         | String  | Sinopsis de la película                                |
| id                  | ID      | ID generado de la película                             |
| imageUrl            | String  | URL de la portada de la película                       |
| subscriptionPackage | String  | Nombre del paquete/suscripción de la película          |
| title               | String  | Título de la película                                  |
| trailerUrl          | String  | Caracteres del URL después del signo "=" en YouTube    |

```graphql
subscription PremiumMovieAdded {
  premiumMovieAdded {
    id
    title
    description
    category
    subscriptionPackage
    imageUrl
    trailerUrl
    createdAt
  }
}
```

Esta suscripción es útil para mantener a los clientes actualizados cuando se añade una nueva película al paquete premium.