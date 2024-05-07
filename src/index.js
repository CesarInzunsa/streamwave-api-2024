// Importar las dependencias necesarias
import {ApolloServer} from '@apollo/server';
import {createServer} from 'http';
import {expressMiddleware} from '@apollo/server/express4';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import express from 'express';
import {WebSocketServer} from 'ws';
import {useServer} from 'graphql-ws/lib/use/ws';
import {PubSub} from 'graphql-subscriptions';
import {readFileSync} from 'fs';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {v4 as uuidv4} from 'uuid';

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
        subscriptionPackage: 'BASICO',
        imageUrl: 'https://m.media-amazon.com/images/I/51ZPj3n6yHL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=VyHV0BRtdxo',
        createdAt: "2024-05-07T16:54:52.212Z"
    },
    {
        id: '6d48b5fa07e3c9a2f1e48d53',
        title: 'Harry Potter and the Philosopher\'s Stone',
        description: 'Harry Potter has lived under the stairs at his aunt and uncle\'s house his whole life. But on his 11th birthday, he learns he\'s a powerful wizard -- with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.',
        subscriptionPackage: 'ESTANDAR',
        imageUrl: 'https://m.media-amazon.com/images/I/51ZPj3n6yHL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=VyHV0BRtdxo',
        createdAt: "2024-05-07T16:54:52.212Z"
    },
    {
        id: 'e2f5a394d7b68e1c40b9a82f',
        title: 'Harry Potter and the Philosopher\'s Stone',
        description: 'Harry Potter has lived under the stairs at his aunt and uncle\'s house his whole life. But on his 11th birthday, he learns he\'s a powerful wizard -- with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.',
        subscriptionPackage: 'PREMIUM',
        imageUrl: 'https://m.media-amazon.com/images/I/51ZPj3n6yHL._AC_.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=VyHV0BRtdxo',
        createdAt: "2024-05-07T16:54:52.212Z"
    }
];

let users = [
    {
        id: 'b7d4e3a8f6c90e4b1f25d63a',
        name: 'John Doe',
        email: 'example1@example.com',
        password: '123456',
        subscriptionPackage: 'BASICO',
        createdAt: "02-05-2024"
    },
    {
        id: '8c5a1d9f7e4b36a0b2e7f5d8',
        name: 'John Doe',
        email: 'example2@example.com',
        password: '123456',
        subscriptionPackage: 'ESTANDAR',
        createdAt: "02-05-2024"
    },
    {
        id: '9a7b3e4f8c6d2e1b5f9a0c47',
        name: 'John Doe',
        email: 'example3@example.com',
        password: '123456',
        subscriptionPackage: 'PREMIUM',
        createdAt: "02-05-2024"
    }
];

const MOVIE_ADDED = 'MOVIE_ADDED';
const USER_ADDED = 'USER_ADDED';

const resolvers = {
    Query: {
        getAllMoviesBySubscription: (root, args) => {
            // Si el argumento subscriptionPackage no es 'BASICO', 'ESTANDAR, 'PREMIUM', retornar un arreglo vacío
            if (!['BASICO', 'ESTANDAR', 'PREMIUM'].includes(args.subscriptionPackage)) return [];

            // Retornar una copia profunda de las películas que coincidan con el subscriptionPackage
            return JSON.parse(JSON.stringify(movies.filter(movie => movie.subscriptionPackage === args.subscriptionPackage)));
        },
        getAllUsers: () => {
            // Retornar una copia profunda de todos los usuarios
            return JSON.parse(JSON.stringify(users));
        },
        getMovieById: (root, args) => {
            // Buscar y retornar una copia profunda de la película que coincida con él id
            return JSON.parse(JSON.stringify(movies.find(movie => movie.id === args.id)));
        },
        getUserById: (root, args) => {
            // Buscar y retornar una copia profunda del usuario que coincida con él id
            return JSON.parse(JSON.stringify(users.find(user => user.id === args.id)));
        }
    },
    Mutation: {
        createMovie: (root, args) => {
            // Verificar que los argumentos proporcionados no estén vacíos
            if (Object.values(args).some(value => value === '')) return 'Todos los campos son requeridos';
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
            // Publicar la película creada
            pubsub.publish(MOVIE_ADDED, {movieAdded: newMovie});
            // Retornar un mensaje de éxito
            return 'Película creada con éxito';
        },
    },
    Subscription: {
        movieAdded: {
            subscribe: () => pubsub.asyncIterator([MOVIE_ADDED]),
            resolve: (payload) => {
                // Retornar la película que acaba de ser creada
                return payload.movieAdded;
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

const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
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
    ]
});

await apolloServer.start();

app.use('/graphql', bodyParser.json(), expressMiddleware(apolloServer));

httpServer.listen(port, () => {
    console.log(`🚀 Query endpoint ready at http://localhost:${port}/graphql`);
    console.log(`🚀 Subscription endpoint ready at ws://localhost:${port}/graphql`);
});

