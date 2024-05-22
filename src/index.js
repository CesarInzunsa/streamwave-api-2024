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
            title: 'Harry Potter y la piedra filosofal',
            description: 'Harry Potter ha vivido debajo de las escaleras en la casa de sus tíos toda su vida. Pero en su undécimo cumpleaños, descubre que es un poderoso mago y que tiene un lugar esperándolo en el Colegio Hogwarts de Magia y Hechicería.',
            category: 'Drama',
            subscriptionPackage: 'BASICO',
            imageUrl: 'https://picsum.photos/id/237/600/400',
            trailerUrl: 'VyHV0BRtdxo',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
        {
            id: '6d48b5fa07e3c9a2f1e48d53',
            title: 'El pianista',
            description: 'Wladyslaw Szpilman, un brillante pianista polaco de origen judío, vive con su familia en el ghetto de Varsovia. Cuando, en 1939, los alemanes invaden Polonia, consigue evitar la deportación gracias a la ayuda de algunos amigos.',
            category: 'Drama',
            subscriptionPackage: 'BASICO',
            imageUrl: 'https://picsum.photos/id/238/600/400',
            trailerUrl: 'BFwGqLa_oAo',
            createdAt: "2024-05-07T16:54:52.212Z"
        },
        {
            id: '8a32d7fc09e5c9b4f2e59d87',
            title: 'El irlandés',
            description: 'Frank Sheeran, un veterano de guerra y estafador convertido en asesino a sueldo, reflexiona sobre los eventos que definieron su carrera en el crimen organizado, incluyendo su relación con el legendario jefe del sindicato Jimmy Hoffa.',
            category: 'Crimen',
            subscriptionPackage: 'ESTANDAR',
            imageUrl: 'https://picsum.photos/id/239/600/400',
            trailerUrl: 'B3cJXk9IaH0',
            createdAt: "2024-05-22T11:45:00.000Z"
        },
        {
            id: '7f23c7eb08d4a9b3e4f68d79',
            title: 'Baby Driver',
            description: 'Baby domina el volante como nadie antes lo ha hecho, pero su habilidad está en manos de Doc, el jefe del crimen para el que trabaja. Cansado de ese estilo de vida y de cumplir las normas de este atracador, el joven decide cumplir una última misión antes de retirarse. Pero Doc no se lo va a poner fácil, y menos después de saber que Baby siente algo por una joven llamada Deborah.',
            category: 'Accion',
            subscriptionPackage: 'PREMIUM',
            imageUrl: 'https://picsum.photos/id/240/600/400',
            trailerUrl: '4lc8FxXukcU',
            createdAt: "2024-05-22T10:30:00.000Z"
        },
        {
            id: '8g24d8fc09e5b9c4f5g79e80',
            title: 'Annabelle',
            description: 'John Form ha encontrado el regalo perfecto para su esposa embarazada, Mia: una hermosa muñeca vintage con un vestido de boda blanco puro. Pero la alegría de Mia con Annabelle no dura mucho. En una horrible noche, su hogar es invadido por miembros de un culto satánico, quienes atacan violentamente a la pareja. Derramando sangre y dejando terror tras de sí, los cultistas han conjurado una entidad malévola en la forma de Annabelle.',
            category: 'Terror',
            subscriptionPackage: 'PREMIUM',
            imageUrl: 'https://picsum.photos/id/241/600/400',
            trailerUrl: 'R-StM2rHAc8',
            createdAt: "2024-05-22T10:30:00.000Z"
        },
        {
            id: '9h25e9gd10f6c0d5g6h80f91',
            title: 'Superbad',
            description: 'Seth y Evan son dos adolescentes inseparables que están a punto de graduarse de la escuela secundaria. Decididos a aprovechar al máximo sus últimos días como estudiantes, planean asistir a una fiesta épica. Pero sus planes se complican cuando se enfrentan a una serie de obstáculos ridículos y situaciones hilarantes en su intento por conseguir alcohol para la fiesta. A lo largo de la noche, Seth y Evan descubren el verdadero significado de la amistad.',
            category: 'Comedia',
            subscriptionPackage: 'PREMIUM',
            imageUrl: 'https://picsum.photos/id/242/600/400',
            trailerUrl: '4eaZ_48ZYog',
            createdAt: "2024-05-22T10:30:00.000Z"
        }
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

                    // Si el plan de suscripción es 'BASICO', retornar una copia profunda de las películas que coincidan con el subscriptionPackage
                    if (args.subscriptionPackage === 'BASICO') {
                        return JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === 'BASICO')));
                    }

                    // Si el plan de suscripción es 'ESTANDAR', retornar una copia profunda de las películas que coincidan con el subscriptionPackage y 'BASICO'
                    if (args.subscriptionPackage === 'ESTANDAR') {
                        return JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === 'BASICO' || movie.subscriptionPackage === 'ESTANDAR')));
                    }

                    // Si el plan de suscripción es 'PREMIUM', retornar una copia profunda de todas las películas
                    return JSON.parse(JSON.stringify(movies));
                } catch (error) {
                    console.log(error);
                }
            },
            getMoviesByCategory: (root, args) => {
                try {

                    // Si el argumento subscriptionPackage no es 'BASICO', 'ESTANDAR, 'PREMIUM', retornar un arreglo vacío
                    if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return [];

                    // Obtener todas las peliculas que coincidan con el plan de suscripción
                    let moviesTemp = [];

                    // Si el plan de suscripción es 'BASICO', retornar una copia profunda de las películas que coincidan con el subscriptionPackage
                    if (args.subscriptionPackage === 'BASICO') {
                        moviesTemp = JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === 'BASICO')));
                    }

                    // Si el plan de suscripción es 'ESTANDAR', retornar una copia profunda de las películas que coincidan con el subscriptionPackage y 'BASICO'
                    if (args.subscriptionPackage === 'ESTANDAR') {
                        moviesTemp = JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === 'BASICO' || movie.subscriptionPackage === 'ESTANDAR')));
                    }

                    // Retornar una copia profunda de las películas que coincidan con la categoría proporcionada
                    if (args.subscriptionPackage === 'PREMIUM') {
                        moviesTemp = JSON.parse(JSON.stringify(movies));
                    }

                    // Retornar una copia profunda de las películas que coincidan con la categoría proporcionada
                    return JSON.parse(JSON.stringify(moviesTemp.filter(movie => movie.category === args.category)));
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

