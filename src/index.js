    // Importar las dependencias necesarias
    import { ApolloServer } from '@apollo/server';
    import { createServer } from 'http';
    import { expressMiddleware } from '@apollo/server/express4';
    import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
    import bodyParser from 'body-parser';
    import express from 'express';
    import { WebSocketServer } from 'ws';
    import { useServer } from 'graphql-ws/lib/use/ws';
    import { PubSub } from 'graphql-subscriptions';
    import { readFileSync } from 'fs';
    import { makeExecutableSchema } from '@graphql-tools/schema';
    import { v4 as uuidv4 } from 'uuid';
    import cors from 'cors';
    import { ApolloServerErrorCode } from '@apollo/server/errors';
    import bcrypt from 'bcryptjs';


    // |----------------------------------------------------------------------------------------------------------------|
    // |                                                                                                                |
    // |----------------------------------------------------------------------------------------------------------------|

    function generateId() {
        return uuidv4().replace(/-/g, "").substring(0, 24);
    }

    // Puerto en el que se ejecutará el servidor
    const port = 3000;

    // Lee el esquema GraphQL desde un archivo externo
    const typeDefs = readFileSync('./src/schemas/schema.graphql', 'utf8');

    // Crear una instancia de PubSub
    const pubsub = new PubSub();

    // Arreglos de datos
    let movies = [
        {
            id: '3faedc9b7e8104a5b623c129',
            title: 'Harry Potter and the Philosopher\'s Stone',
            description: 'Harry Potter has lived under the stairs at his aunt and uncle\'s house his whole life. But on his 11th birthday, he learns he\'s a powerful wizard -- with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.',
            category: 'Drama',
            subscriptionPackage: 'BASICO',
            imageUrl: 'https://th.bing.com/th/id/OIP.eGj4A1QtOZ-xrhWhups6BwHaEK?rs=1&pid=ImgDetMain',
            trailerUrl: 'VyHV0BRtdxo',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
        {
            id: '6d48b5fa07e3c9a2f1e48d53',
            title: 'El pianista',
            description: 'Wladyslaw Szpilman, un brillante pianista polaco de origen judío, vive con su familia en el ghetto de Varsovia. Cuando, en 1939, los alemanes invaden Polonia, consigue evitar la deportación gracias a la ayuda de algunos amigos.',
            category: 'Drama',
            subscriptionPackage: 'BASICO',
            imageUrl: 'https://th.bing.com/th/id/OIP.eGj4A1QtOZ-xrhWhups6BwHaEK?rs=1&pid=ImgDetMain',
            trailerUrl: 'BFwGqLa_oAo',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
    ];

    let users = [
        {
            id: 'b7d4e3a8f6c90e4b1f25d63a',
            name: 'Brandon',
            email: 'example1@example.com',
            password: '123456',
            subscriptionPackage: 'BASICO',
            type: 'USER',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
        {
            id: '8c5a1d9f7e4b36a0b2e7f5d8',
            name: 'Alan',
            email: 'example2@example.com',
            password: '123456',
            subscriptionPackage: 'ESTANDAR',
            type: 'USER',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
        {
            id: '9a7b3e4f8c6d2e1b5f9a0c47',
            name: 'Juanito',
            email: 'example3@example.com',
            password: '123456',
            subscriptionPackage: 'PREMIUM',
            type: 'ADMIN',
            createdAt: "2024-05-07T16:54:52.212Z"
        }
    ];

    const MOVIE_ADDED = 'MOVIE_ADDED';
    const USER_ADDED = 'USER_ADDED';
    const BASIC_MOVIE_ADDED = 'BASIC_MOVIE_ADDED';
    const STANDARD_MOVIE_ADDED = 'STANDARD_MOVIE_ADDED';
    const PREMIUM_MOVIE_ADDED = 'PREMIUM_MOVIE_ADDED';

    const resolvers = {
        Query: {
            // GET ALL
            getAllMoviesBySubscription: (root, args) => {
                try {
                    // Si el argumento subscriptionPackage no es 'BASICO', 'ESTANDAR, 'PREMIUM', retornar un arreglo vacío
                    if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return [];

                    // Retornar una copia profunda de las películas que coincidan con el subscriptionPackage
                    return JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === args.subscriptionPackage)));
                } catch (error) {
                    console.log(error);
                }
            },
            getAllUsers: () => {
                try {
                    // Retornar una copia profunda de todos los usuarios
                    return JSON.parse(JSON.stringify(users));
                } catch (error) {
                    console.log(error);
                }
            },
            // GET BY ID
            getMovieById: (root, args) => {
                try {
                    // Buscar y retornar una copia profunda de la película que coincida con él id
                    return JSON.parse(JSON.stringify(movies.find(movie => movie.id === args.id)));
                } catch (error) {
                    console.log(error);
                }
            },
            getUserById: (root, args) => {
                try {
                    // Buscar y retornar una copia profunda del usuario que coincida con él id
                    return JSON.parse(JSON.stringify(users.find(user => user.id === args.id)));
                } catch (error) {
                    console.log(error);
                }
            }
        },
        Mutation: {
            // CREATE
            createMovie: (root, args) => {
                // Verificar que los campos title, description, imageUrl y trailerUrl no estén vacíos
                if (args.title === '' || args.description === '' || args.imageUrl === '' || args.trailerUrl === '') return 'Los campos title, description, imageUrl y trailerUrl son obligatorios';

                // Verificar que la suscripción proporcionada sea 'BASICO', 'ESTANDAR' o 'PREMIUM'
                if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return 'El paquete de suscripción debe ser BASICO, ESTANDAR o PREMIUM';
                // Crear un nuevo objeto de tipo película
                const newMovie = {
                    id: generateId(),
                    title: args.title,
                    description: args.description,
                    subscriptionPackage: args.subscriptionPackage,
                    imageUrl: args.imageUrl,
                    trailerUrl: args.trailerUrl,
                    createdAt: new Date().toISOString()
                };
                // Agregar la nueva película al arreglo de películas
                movies.push(newMovie);
                // Publicar la película creada dependiendo del paquete de suscripción
                switch (newMovie.subscriptionPackage) {
                    case 'BASICO':
                        pubsub.publish(BASIC_MOVIE_ADDED, { basicMovieAdded: newMovie });
                        break;
                    case 'ESTANDAR':
                        pubsub.publish(STANDARD_MOVIE_ADDED, { standardMovieAdded: newMovie });
                        break;
                    case 'PREMIUM':
                        pubsub.publish(PREMIUM_MOVIE_ADDED, { premiumMovieAdded: newMovie });
                        break;
                }
                // Sin importar el paquete de suscripción, publicar la película creada por defecto
                pubsub.publish(MOVIE_ADDED, { movieAdded: newMovie });
                // Retornar un mensaje de éxito
                return 'Película creada con éxito';
            },
            createUser: async (root, args) => {
                // Verificar que la suscripción proporcionada sea 'BASICO', 'ESTANDAR' o 'PREMIUM'
                if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return 'El paquete de suscripción debe ser BASICO, ESTANDAR o PREMIUM';

                // Verificar que el tipo de usuario sea 'USER' o 'ADMIN'
                if (!['USER', 'ADMIN'].includes(args.type)) return 'El tipo de usuario debe ser USER o ADMIN';

                // Verificar que el email no se repita
                if (users.find(user => user.email === args.email)) return 'El email ya está en uso';

                // Encriptar la contraseña
                const hashedPassword = await bcrypt.hash(args.password, 10);

                // Crear un nuevo objeto de tipo usuario
                const newUser = {
                    id: generateId(),
                    name: args.name,
                    email: args.email,
                    password: hashedPassword,
                    subscriptionPackage: args.subscriptionPackage,
                    type: args.type,
                    createdAt: new Date().toISOString()
                };
                // Agregar el nuevo usuario al arreglo de usuarios
                users.push(newUser);
                // Publicar el usuario creado
                pubsub.publish(USER_ADDED, { userAdded: newUser });
                // Retornar un mensaje de éxito
                return 'Usuario creado con éxito';
            },
            // DELETE
            deleteMovie: (root, args) => {
                // Buscar el índice de la película que coincida con él id, si no existe retornar un mensaje de error
                const index = movies.findIndex(movie => movie.id === args.id);
                if (index === -1) return 'La película no existe';
                // Filtrar todas las películas a excepción de la que se quiere eliminar, y actualizar la lista de películas
                movies = JSON.parse(JSON.stringify(movies.filter(movie => movie.id !== args.id)));
                // Retornar un mensaje de éxito
                return 'Película eliminada con éxito';
            },
            deleteUser: (root, args) => {
                // Buscar el índice del usuario que coincida con él id, si no existe retornar un mensaje de error
                const index = users.findIndex(user => user.id === args.id);
                if (index === -1) return 'El usuario no existe';
                // Filtrar todos los usuarios a excepción del que se quiere eliminar, y actualizar la lista de usuarios
                users = JSON.parse(JSON.stringify(users.filter(user => user.id !== args.id)));
                // Retornar un mensaje de éxito
                return 'Usuario eliminado con éxito';
            },
            // UPDATE
            updateMovie: (root, args) => {
                // Buscar el índice de la película que coincida con él id, si no existe retornar un mensaje de error
                const index = movies.findIndex(movie => movie.id === args.id);
                if (index === -1) return 'La película no existe';
                // Obtener la información de los argumentos
                const { title, description, subscriptionPackage, imageUrl, trailerUrl } = args;
                // Actualizar la información de la película
                movies[index] = {
                    ...movies[index],
                    title: title || movies[index].title,
                    description: description || movies[index].description,
                    subscriptionPackage: subscriptionPackage || movies[index].subscriptionPackage,
                    imageUrl: imageUrl || movies[index].imageUrl,
                    trailerUrl: trailerUrl || movies[index].trailerUrl
                };
                // Retornar un mensaje de éxito
                return 'Película actualizada con éxito';
            },
            updateUser: async (root, args) => {
                // Buscar el índice del usuario que coincida con él id, si no existe retornar un mensaje de error
                const index = users.findIndex(user => user.id === args.id);
                if (index === -1) return 'El usuario no existe';
                // Obtener la información de los argumentos
                const { name, email, password, subscriptionPackage } = args;

                // Encriptar la nueva contraseña si se proporciona
                let hashedPassword = users[index].password;
                if (password) {
                    hashedPassword = await bcrypt.hash(password, 10);
                }
                
                // Actualizar la información del usuario
                users[index] = {
                    ...users[index],
                    name: name || users[index].name,
                    email: email || users[index].email,
                    password: hashedPassword || users[index].password,
                    subscriptionPackage: subscriptionPackage || users[index].subscriptionPackage
                };
                // Retornar un mensaje de éxito
                return 'Usuario actualizado con éxito';
            },
            // LOGIN
            login: async (root, args) => {
                // Buscar un usuario que coincida con el email proporcionado
                const user = users.find(user => user.email === args.email);
            
                // Si no se encuentra un usuario, retornar un mensaje de error
                if (!user) return 'Credenciales incorrectas';
            
                // Verificar la contraseña
                const isPasswordValid = await bcrypt.compare(args.password, user.password);
            
                // Si la contraseña no es válida, retornar un mensaje de error
                if (!isPasswordValid) return 'Credenciales incorrectas';
            
                // Retornar el usuario encontrado si las credenciales son correctas
                return 'Inicio correctamente el usuario';
            }
            
        },
        Subscription: {
            movieAdded: {
                subscribe: () => pubsub.asyncIterator([MOVIE_ADDED]),
                resolve: (payload) => {
                    // Retornar la película que acaba de ser creada
                    return payload.movieAdded;
                }
            },
            basicMovieAdded: {
                subscribe: () => pubsub.asyncIterator([BASIC_MOVIE_ADDED]),
                resolve: (payload) => {
                    // Retornar la película que acaba de ser creada, si el paquete de suscripción es 'BASICO'
                    return payload.basicMovieAdded;
                }
            },
            standardMovieAdded: {
                subscribe: () => pubsub.asyncIterator([STANDARD_MOVIE_ADDED]),
                resolve: (payload) => {
                    // Retornar la película que acaba de ser creada, si el paquete de suscripción es 'ESTANDAR'
                    return payload.standardMovieAdded;
                }
            },
            premiumMovieAdded: {
                subscribe: () => pubsub.asyncIterator([PREMIUM_MOVIE_ADDED]),
                resolve: (payload) => {
                    // Retornar la película que acaba de ser creada, si el paquete de suscripción es 'PREMIUM'
                    return payload.premiumMovieAdded;
                }
            },
            userAdded: {
                subscribe: () => pubsub.asyncIterator([USER_ADDED]),
                resolve: (payload) => {
                    // Retornar el usuario que acaba de ser creado
                    return payload.userAdded;
                }
            }
        },
    }

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const app = express();
    const httpServer = createServer(app);
    app.use(cors());

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql'
    });

    const wsServerCleanup = useServer({ schema }, wsServer);

    const apolloServer = new ApolloServer({
        schema,
        plugins: [
            // Proper shutdown for the HTTP server.
            ApolloServerPluginDrainHttpServer({ httpServer }),

            // Proper shutdown for the WebSocket server.
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await wsServerCleanup.dispose();
                        }
                    }
                }
            }
        ],
        formatError: (formattedError, error) => {
            // Return a different error message
            if (
                formattedError.extensions.code ===
                ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED || formattedError.extensions.code === ApolloServerErrorCode.GRAPHQL_PARSE_FAILED || formattedError.extensions.code === ApolloServerErrorCode.BAD_USER_INPUT
            ) {
                return {
                    //...formattedError,
                    message: "Ocurrio un error en el query de GraphQL, por favor revisa la documentación de la API",
                    location: formattedError.locations
                };
            }

            // Otherwise return the formatted error. This error can also
            // be manipulated in other ways, as long as it's returned.
            return formattedError;
        },
    });

    await apolloServer.start();

    app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer));

    httpServer.listen(port, () => {
        console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`);
        console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`);
    });

