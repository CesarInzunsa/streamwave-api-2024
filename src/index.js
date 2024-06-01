// Importar las dependencias necesarias
import {ApolloServer} from '@apollo/server';
import {createServer} from 'http';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import express from 'express';
import {WebSocketServer, WebSocket} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import {PubSub} from 'graphql-subscriptions';
import {readFileSync} from 'fs';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {v4 as uuidv4} from 'uuid';
import cors from 'cors';
import {ApolloServerErrorCode} from '@apollo/server/errors';
import bcrypt from 'bcryptjs';
import {Pelicula, Usuario} from './db.js';


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

const MOVIE_ADDED = 'MOVIE_ADDED';
const USER_ADDED = 'USER_ADDED';
const BASIC_MOVIE_ADDED = 'BASIC_MOVIE_ADDED';
const STANDARD_MOVIE_ADDED = 'STANDARD_MOVIE_ADDED';
const PREMIUM_MOVIE_ADDED = 'PREMIUM_MOVIE_ADDED';

const resolvers = {
    LoginResult: {
        __resolveType(obj, context, info) {
            if (obj.message) {
                return 'LoginError';
            }

            if (obj.email) {
                return 'User';
            }

            return null;
        },
    },
    Query: {
        // GET ALL
        getAllMoviesBySubscription: async (root, args) => {
            try {
                // Si el argumento subscriptionPackage no es 'BASICO', 'ESTANDAR, 'PREMIUM', retornar un arreglo vacío
                if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return [];

                // Si el argumento subscriptionPackage es 'BASICO', retornar las películas de ese plan
                if (args.subscriptionPackage === 'BASICO') {
                    return await Pelicula.find({subscriptionPackage: 'BASICO'});
                }

                // Si el argumento subscriptionPackage es 'ESTANDAR', retornar una las películas de ese plan y las de 'BASICO'
                if (args.subscriptionPackage === 'ESTANDAR') {
                    return await Pelicula.find({subscriptionPackage: {$in: ['BASICO', 'ESTANDAR']}});
                }

                // Si el argumento subscriptionPackage es 'ESTANDAR', retornar una las películas de ese plan y las de 'BASICO'
                if (args.subscriptionPackage === 'PREMIUM') {
                    return await Pelicula.find({subscriptionPackage: {$in: ['BASICO', 'ESTANDAR', 'PREMIUM']}});
                }
            } catch (error) {
                console.log(error);
            }
        },
        getMoviesByCategory: async (root, args) => {
            try {
                // Si el argumento subscriptionPackage no es 'BASICO', 'ESTANDAR, 'PREMIUM', retornar un arreglo vacío
                if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return [];

                // Si el argumento subscriptionPackage es 'BASICO', retornar las películas de ese plan
                if (args.subscriptionPackage === 'BASICO') {
                    return await Pelicula.find({category: args.category, subscriptionPackage: 'BASICO'});
                }

                // Si el argumento subscriptionPackage es 'ESTANDAR', retornar una las películas de ese plan y las de 'BASICO'
                if (args.subscriptionPackage === 'ESTANDAR') {
                    return await Pelicula.find({category: args.category, subscriptionPackage: {$in: ['BASICO', 'ESTANDAR']}});
                }

                // Si el argumento subscriptionPackage es 'ESTANDAR', retornar una las películas de ese plan y las de 'BASICO'
                if (args.subscriptionPackage === 'PREMIUM') {
                    return await Pelicula.find({category: args.category, subscriptionPackage: {$in: ['BASICO', 'ESTANDAR', 'PREMIUM']}});
                }
            } catch (error) {
                console.log(error);
            }
        },
        getAllUsers: async () => {
            try {
                // Retornar una copia profunda de todos los usuarios
                // return JSON.parse(JSON.stringify(users));
                return await Usuario.find();
            } catch (error) {
                console.log(error);
            }
        },
        getAllMovies: async () => {
            try {
                // Retornar una copia profunda de todos los usuarios
                // return JSON.parse(JSON.stringify(users));
                return await Pelicula.find();
            } catch (error) {
                console.log(error);
            }
        },
        // GET BY ID
        getMovieById: async (root, args) => {
            try {
                // Buscar y retornar una copia profunda de la película que coincida con él id
                //return JSON.parse(JSON.stringify(movies.find(movie => movie.id === args.id)));
                return await Pelicula.findById(args.id);
            } catch (error) {
                console.log(error);
            }
        },
        getUserById: async (root, args) => {
            try {
                // Buscar y retornar una copia profunda del usuario que coincida con él id
                //return JSON.parse(JSON.stringify(users.find(user => user.id === args.id)));
                return await Usuario.findById(args.id);
            } catch (error) {
                console.log(error);
            }
        }
    },
    Mutation: {
        // CREATE
        createMovie: async (root, args) => {
            // Verificar que los campos title, description, imageUrl y trailerUrl no estén vacíos
            if (args.title === '' || args.description === '' || args.imageUrl === '' || args.trailerUrl === '') return 'Los campos title, description, imageUrl y trailerUrl son obligatorios';

            // Verificar que la suscripción proporcionada sea 'BASICO', 'ESTANDAR' o 'PREMIUM'
            if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return 'El paquete de suscripción debe ser BASICO, ESTANDAR o PREMIUM';
            // Crear un nuevo objeto de tipo película
            const newMovie = new Pelicula({
                title: args.title,
                description: args.description,
                category: args.category,
                subscriptionPackage: args.subscriptionPackage,
                imageUrl: args.imageUrl,
                trailerUrl: args.trailerUrl,
                createdAt: new Date().toISOString()
            });
            // Agregar la nueva película al arreglo de películas
            await newMovie.save();
            // Publicar la película creada dependiendo del paquete de suscripción
            switch (newMovie.subscriptionPackage) {
                case 'BASICO':
                    pubsub.publish(BASIC_MOVIE_ADDED, {basicMovieAdded: newMovie});
                    break;
                case 'ESTANDAR':
                    pubsub.publish(STANDARD_MOVIE_ADDED, {standardMovieAdded: newMovie});
                    break;
                case 'PREMIUM':
                    pubsub.publish(PREMIUM_MOVIE_ADDED, {premiumMovieAdded: newMovie});
                    break;
            }
            // Sin importar el paquete de suscripción, publicar la película creada por defecto
            pubsub.publish(MOVIE_ADDED, {movieAdded: newMovie});
            // Retornar un mensaje de éxito
            return 'Película creada con éxito';
        },
        createUser: async (root, args) => {
            // Verificar que la suscripción proporcionada sea 'BASICO', 'ESTANDAR' o 'PREMIUM'
            if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return 'El paquete de suscripción debe ser BASICO, ESTANDAR o PREMIUM';

            // Verificar que el tipo de usuario sea 'USER' o 'ADMIN'
            if (!['USER', 'ADMIN'].includes(args.type)) return 'El tipo de usuario debe ser USER o ADMIN';

            // Verificar que el email no se repita
            if (await Usuario.findOne({email: args.email})) return 'El email ya está en uso';

            // Encriptar la contraseña
            const hashedPassword = await bcrypt.hash(args.password, 10);

            // Crear un nuevo objeto de tipo usuario
            const newUser = new Usuario({
                name: args.name,
                email: args.email,
                password: hashedPassword,
                subscriptionPackage: args.subscriptionPackage,
                type: args.type
            });
            // Agregar el nuevo usuario al arreglo de usuarios
            await newUser.save();
            // Publicar el usuario creado
            pubsub.publish(USER_ADDED, {userAdded: newUser});
            // Retornar un mensaje de éxito
            return 'Usuario creado con éxito';
        },
        // DELETE
        deleteMovie: async (root, args) => {
            try {
                // Buscar el índice de la película que coincida con él id, si no existe retornar un mensaje de error
                const deletedMovie = await Pelicula.findByIdAndDelete(args.id);

                // Si no se encuentra ninguna película con el ID dado, retornar un mensaje de error
                if (!deletedMovie) {
                    return 'La película no existe';
                }

                // Retornar un mensaje de éxito
                return 'Película eliminada con éxito';
            } catch (error) {
                // Si ocurre algún error durante el proceso de eliminación, retornar un mensaje de error
                console.error('Error al eliminar la película:', error);
                return 'Ocurrió un error al eliminar la película';
            }
        },
        deleteUser: async (root, args) => {
            try {
                // Buscar el índice del usuario que coincida con él id, si no existe retornar un mensaje de error
                const deletedUser = await Usuario.findByIdAndDelete(args.id);

                // Si no se encuentra ningún usuario con el ID dado, retornar un mensaje de error
                if (!deletedUser) {
                    return 'El usuario no existe';
                }

                // Retornar un mensaje de éxito
                return 'Usuario eliminado con éxito';
            } catch (error) {
                // Si ocurre algún error durante el proceso de eliminación, retornar un mensaje de error
                console.error('Error al eliminar el usuario:', error);
                return 'Ocurrió un error al eliminar el usuario';
            }
        },
        // UPDATE
        updateMovie: async (root, args) => {
            try {
                // Buscar y actualizar la película por su ID
                const updatedMovie = await Pelicula.findByIdAndUpdate(args.id, args, {new: true});

                // Si no se encuentra ninguna película con el ID dado, retornar un mensaje de error
                if (!updatedMovie) {
                    return 'La película no existe';
                }

                // Retornar un mensaje de éxito
                return 'Película actualizada con éxito';
            } catch (error) {
                // Si ocurre algún error durante el proceso de actualización, retornar un mensaje de error
                console.error('Error al actualizar la película:', error);
                return 'Ocurrió un error al actualizar la película';
            }
        },
        updateUser: async (root, args) => {
            try {
                // Buscar y actualizar el usuario por su ID
                const user = await Usuario.findById(args.id);

                // Si no se encuentra ningún usuario con el ID dado, retornar un mensaje de error
                if (!user) {
                    return 'El usuario no existe';
                }

                // Actualizar la información del usuario con los nuevos valores proporcionados
                if (args.name) {
                    user.name = args.name;
                }
                if (args.email) {
                    user.email = args.email;
                }
                // Encriptar la nueva contraseña
                if (args.password) {
                    user.password = await bcrypt.hash(args.password, 10);
                }
                if (args.subscriptionPackage) {
                    user.subscriptionPackage = args.subscriptionPackage;
                }

                // Guardar los cambios en la base de datos
                await user.save();

                // Retornar un mensaje de éxito
                return 'Usuario actualizado con éxito';
            } catch (error) {
                // Si ocurre algún error durante el proceso de actualización, retornar un mensaje de error
                console.error('Error al actualizar el usuario:', error);
                return 'Ocurrió un error al actualizar el usuario';
            }
        },
        // LOGIN
        login: async (_, { email, password }) => {
            try {
                // Buscar un usuario que coincida con el email proporcionado en la base de datos
                const user = await Usuario.findOne({email: email});

                // Si no se encuentra un usuario con el email proporcionado, retornar un mensaje de error
                if (!user) {
                    return {
                        success: false,
                        message: 'Credenciales incorrectas',
                    }
                }
                // Verificar la contraseña utilizando bcrypt
                const isPasswordValid = await bcrypt.compare(password, user.password);

                // Si la contraseña no es válida, retornar un mensaje de error
                if (!isPasswordValid) {
                    return {
                        success: false,
                        message: 'Credenciales incorrectas',
                    }
                }

                // Si las credenciales son válidas, retornar un mensaje de éxito junto con el usuario autenticado
                return user
            } catch (error) {
                // Si ocurre algún error durante el proceso de autenticación, retornar un mensaje de error
                console.error('Error al iniciar sesión:', error);
                return {
                    success: false,
                    message: 'Ocurrió un error al iniciar sesión',
                }
            }
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

const schema = makeExecutableSchema({typeDefs, resolvers});

const app = express();
const httpServer = createServer(app);
app.use(cors());

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});

wsServer.on('connection', ws => {
    console.log('A new WebSocket connection has been established');
    ws.on('open', () => {
        console.log('The WebSocket connection is open');
    });
    ws.on('message', message => {
        console.log(`Received message => ${message}`);
    });
    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed with code ${code} and reason: ${reason}`);
    });

});

const wsServerCleanup = useServer({schema}, wsServer);

const apolloServer = new ApolloServer({
    schema,
    plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({httpServer}),

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

