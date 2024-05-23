// db.js
import mongoose from 'mongoose';

const conexionMongo = 'mongodb+srv://brjezunigalo:lQxobbMphx7HAGO6@streamwavebd.jhle5xh.mongodb.net/StreamWave?retryWrites=true&w=majority&appName=streamWaveBD';

mongoose.connect(conexionMongo, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Conectado a MongoDB');
});

const movieSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    subscriptionPackage: String,
    imageUrl: String,
    trailerUrl: String,
    createdAt: {
        type: Date,
        default: Date.now // Esto establece la fecha actual como valor predeterminado si no se proporciona ninguna fecha
    }
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    subscriptionPackage: String,
    type: String,
    createdAt: {
        type: Date,
        default: Date.now // Esto establece la fecha actual como valor predeterminado si no se proporciona ninguna fecha
    }
});

// Crear los modelos
const Pelicula = mongoose.model('Movie', movieSchema);
const Usuario = mongoose.model('User', userSchema);

export { Pelicula, Usuario };