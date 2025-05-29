
Final Project - StreamWave (BackEnd)  
Desarrollo de servicios web  
Instituto Recnologico de Tepic

# Members
- Guzmán Álvarez Jorge Alberto - 20400751
- Inzunsa Diaz Cesar Alejandro - 19400595
- Rodriguez Godinez Alan Daniel - 20400812
- Zuñiga Lopez Brandon Jesus - 20400844

# Deployment
- GraphQL: https://streamwave-api-2024.onrender.com/graphql
- Subscriptions: ws://https://streamwave-api-2024.onrender.com/graphql 

# Introduction
This system was created based on our proposal which was to create a movie streaming service, in this system users can register and log in to watch movies depending on the type of package that has been selected.
Another type of user that can interact in this system are the administrators, as an administrator you have the possibility to add, modify or delete clients or movies as necessary.
The movies consist of their title, description, image, trailer, category and package.

In general, our objective was to test everything we have learned in the subject, so we will use GraphQL making use of queries, mutations and subscriptions.

Through this document we will focus on the backend and show the various operations that our system can perform and how to consume the APIs effectively.

It should be mentioned that our project is connected to a database in mongo Atlas which its connection is established in the src/db.js file

# Test ADMIN type user to use in the apk
- User: cesar@streamwave.com
- Password: admin123

# Test USER type user to use in the apk
User 1 with PREMIUM package
- User: juanito@example.com
- Password: 123456
- Package: PREMIUM
User 2 with BASIC package  
- User: example@example.com
- Password: admin123
- Package: BASIC

# APIs

All APIs were developed in graphQL

## Querys
### getAllMovies
Get all movies added to the database

This request returns the desired information about all the movies that are added to the database.

| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Movie category                                                   |
| createdAt           | String  | Date the movie was added to the catalog                          |
| description         | String  | Movie synopsis                                                   |
| id                  | ID      | Generated movie ID                                               |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the package/subscription                                 |
| title               | String  | Movie title                                                      |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123)|

The fields are, so to speak, the filters; the information that is returned to us will have to do with the selected fields.

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
Get all movies by subscription

This request returns the information of the movies that can be watched depending on the chosen subscription or package (BASIC|STANDARD|PREMIUM).

#### Variables:
| Field                | Type    | Description                        |
|----------------------|---------|------------------------------------|
| subscriptionPackage  | String  | Name of the package/subscription (mandatory) |
#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Movie category                                                   |
| createdAt           | String  | Date the movie was added to the catalog                          |
| description         | String  | Movie synopsis                                                   |
| id                  | ID      | Generated movie ID                                               |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the package/subscription                                 |
| title               | String  | Movie title                                                      |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123)|

Regarding the fields, it can be seen that none are mandatory as they serve as a filter for the information that is desired to be returned. However, at least one must be selected for it to return the information.

Regarding the variables, we refer to a parameter that is necessary to insert a value for it to work. In this case, being one of the packages, only the values "BASIC", "STANDARD" and "PREMIUM" are accepted.

Example of use:
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
Get all movies by category

This request returns the information of all the movies both by their category and the selected package.
#### Variables:
| Field                | Type    | Description                        |
|----------------------|---------|------------------------------------|
| subscriptionPackage  | String  | Name of the package/subscription (mandatory) |
| category             | String  | Category of the movies (mandatory)     |

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Movie category                                                   |
| createdAt           | String  | Date the movie was added to the catalog                          |
| description         | String  | Movie synopsis                                                   |
| id                  | ID      | Generated movie ID                                               |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the package/subscription                                 |
| title               | String  | Movie title                                                      |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123)|

Just like in the previous queries, the variables are mandatory parameters. In this case, two must be inserted for it to work correctly: the package can be "BASIC", "STANDARD" or "PREMIUM" while the category can be "Drama", "Horror", "Action", "Comedy" or "Crime". The fields are the information that is desired to be returned.

Example of use:
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
Get movie by its ID

This request returns the information of a specific movie which must be selected by its ID.

#### Variables:
| Field  | Type | Description                    |
|--------|------|--------------------------------|
| id     | ID   | Generated movie ID (mandatory) |

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Movie category                                                   |
| createdAt           | String  | Date the movie was added to the catalog                          |
| description         | String  | Movie synopsis                                                   |
| id                  | ID      | Generated movie ID                                               |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the package/subscription                                 |
| title               | String  | Movie title                                                      |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123)|

In this case, the parameter is the ID of the movie, which is automatically generated by the program.

Being a movie, all fields are the same as in the previous queries.

Example of use:
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
Get all users

This request returns the desired information of all users registered in the database.
#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | Generated user ID                                                |
| name                | String  | User name                                                        |
| email               | String  | User email                                                       |
| password            | String  | User password                                                    |
| subscriptionPackage | String  | Name of the package selected by the user                         |
| type                | String  | Type of user, either "user" or "administrator"                   |
| createdAt           | String  | Date the user was created                                        |

This request does not require parameters. However, being another model, its fields are different, although it still works the same as the others.

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
Get user by ID

This request returns the desired information of a specific user through their ID.

#### Variables:
| Field | Type | Description                    |
|-------|------|--------------------------------|
| id    | ID   | Generated user ID (mandatory) |

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | User ID                                                          |
| name                | String  | User name                                                        |
| email               | String  | User email                                                       |
| password            | String  | User password                                                    |
| subscriptionPackage | String  | Name of the package selected by the user                         |
| type                | String  | Type of user, either "user" or "administrator"                   |
| createdAt           | String  | Date when the user was created                                   |

This request only changes in that it requires a parameter, which is the user ID.

Example of use:
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
Create a Movie

In this mutation, a movie will be created and added to the database by inserting the corresponding data.

#### Arguments:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| title               | String  | Title of the movie (mandatory)                                   |
| description         | String  | Synopsis of the movie (mandatory)                                |
| category            | String  | Category of the movie (mandatory)                                |
| subscriptionPackage | String  | Package to which the movie will be added (mandatory)             |
| imageUrl            | String  | URL of the image to be used as the movie cover (mandatory)       |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123) (mandatory) |

As this is a mutation in which a new movie is added, all parameters are necessary for its functionality. If information is not added in any of the fields, an error will be displayed as empty fields are not allowed.

#### Example of use:
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
Create a User

In this mutation, a user will be created and added to the database after inserting all the necessary information.

#### Arguments:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| name                | String  | User name (mandatory)                                            |
| email               | String  | User email (mandatory)                                           |
| password            | String  | User password (mandatory)                                        |
| type                | String  | User type, either "USER" or "ADMIN" (mandatory)                  |
| subscriptionPackage | String  | The name of the package that the user has selected               |

This mutation adds a new user to the database, so all parameters are mandatory for its correct operation. This mutation does not accept empty fields, so it will display an error if it does not find registered information.

#### Example of use:
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
Delete a Movie

This mutation removes a movie from the database using its ID.

#### Arguments:
| Field | Type | Description                    |
|-------|------|--------------------------------|
| id    | ID   | Generated ID of the movie (mandatory) |

This mutation only requires one parameter, which is the ID, as this is the simplest way to find a movie and thus eliminate all its information.

#### Example of use:
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
Delete a User

This mutation removes a user from the database using their ID.

#### Arguments:
| Field | Type | Description                    |
|-------|------|--------------------------------|
| id    | ID   | Generated ID of the user (mandatory) |

Similarly, as this is a deletion, only the user's ID is required to find and then remove them from the database.

#### Example of use:
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
Modify a Movie

This mutation allows us to update the data of a specific movie using its ID.

#### Arguments:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | Generated ID of the movie (mandatory)                            |
| category            | String  | Category of the movie (mandatory)                                |
| description         | String  | Synopsis of the movie (mandatory)                                |
| imageUrl            | String  | URL of the movie cover (mandatory)                               |
| subscriptionPackage | String  | Name of the subscription/package (mandatory)                     |
| title               | String  | Title of the movie (mandatory)                                   |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube (e.g. abc123) (mandatory) |

This request gives us the possibility to modify the data of a specific movie if required, commonly due to an error. This mutation also requires all the fields mentioned above for its correct operation.

#### Example of use:
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
Update User

This mutation allows us to modify the data of a registered user in the database using their ID.

#### Arguments:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | User ID (mandatory)                                              |
| name                | String  | User name (mandatory)                                            |
| email               | String  | User email (mandatory)                                           |
| password            | String  | User password (mandatory)                                        |
| subscriptionPackage | String  | Name of the package selected by the user (mandatory)             |

This request allows us to modify the information associated with a specific user through their ID. It requires all the fields mentioned above to function correctly.

#### Example of use:
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
Log In

This request allows the user to log into the system.

#### Arguments:
| Field   | Type    | Description                                |
|---------|---------|--------------------------------------------|
| email   | String  | User's email (mandatory)                   |
| password| String  | User's password (mandatory)                |

Upon entering the data, our system will return the user's information. However, the information will be encrypted for increased security.

#### Example of use:
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
Note: All subscriptions must be initiated before the queries/mutations to display the result

### movieAdded, basicMovieAdded, standardMovieAdded, premiumMovieAdded

These subscriptions will show the status of the subscription server when a new movie is added.
Basically, all these subscriptions work the same, the difference lies in what type of package the movie is included in, the first subscription "movieAdded" will show all movies regardless of the package, however "basicMovieAdded", "standardMovieAdded", and "premiumMovieAdded" will show the movies added to the "BASIC", "STANDARD" and "PREMIUM" packages respectively.


### movieAdded
This subscription shows the status of the subscription server when a new movie is added.

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Category of the movie                                            |
| createdAt           | String  | Date when the movie was added to the catalog                     |
| description         | String  | Synopsis of the movie                                            |
| id                  | ID      | Generated ID of the movie                                        |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the movie's subscription/package                         |
| title               | String  | Title of the movie                                               |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube              |

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

This subscription is useful for keeping customers updated when a new movie is added to the system.

### userAdded
This subscription shows the status of the subscription server when a new user is added.

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| id                  | ID      | User ID                                                          |
| name                | String  | User name                                                        |
| email               | String  | User email                                                       |
| password            | String  | User password                                                    |
| subscriptionPackage | String  | Name of the package selected by the user                         |
| type                | String  | Type of user (user or administrator)                             |
| createdAt           | String  | Date when the user was created                                   |

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

This subscription is useful for keeping customers updated when a new user is added to the system.

### BasicMovieAdded
This subscription shows the status of the subscription server when a new movie is added to the basic package.

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Category of the movie                                            |
| createdAt           | String  | Date when the movie was added to the catalog                     |
| description         | String  | Synopsis of the movie                                            |
| id                  | ID      | Generated ID of the movie                                        |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the movie's subscription/package                         |
| title               | String  | Title of the movie                                               |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube              |

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

This subscription is useful for keeping customers updated when a new movie is added to the standard package.

### StandardMovieAdded
This subscription shows the status of the subscription server when a new movie is added to the standard package.

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Category of the movie                                            |
| createdAt           | String  | Date when the movie was added to the catalog                     |
| description         | String  | Synopsis of the movie                                            |
| id                  | ID      | Generated ID of the movie                                        |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the movie's subscription/package                         |
| title               | String  | Title of the movie                                               |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube              |

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

This subscription is useful for keeping customers updated when a new movie is added to the premium package.

### PremiumMovieAdded
This subscription shows the status of the subscription server when a new movie is added to the premium package.

#### Fields:
| Field               | Type    | Description                                                      |
|---------------------|---------|------------------------------------------------------------------|
| category            | String  | Category of the movie                                            |
| createdAt           | String  | Date when the movie was added to the catalog                     |
| description         | String  | Synopsis of the movie                                            |
| id                  | ID      | Generated ID of the movie                                        |
| imageUrl            | String  | URL of the movie cover                                           |
| subscriptionPackage | String  | Name of the movie's subscription/package                         |
| title               | String  | Title of the movie                                               |
| trailerUrl          | String  | Characters of the URL after the "=" sign on YouTube              |

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

This subscription is useful for keeping customers updated when a new movie is added to the premium package.