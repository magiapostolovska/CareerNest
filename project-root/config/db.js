const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/careerNest'; 

async function connectDb() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
        console.log('Connected to MongoDB successfully');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections found:', collections.map(c => c.name));
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        throw err; 
    }
}

module.exports = connectDb; 

