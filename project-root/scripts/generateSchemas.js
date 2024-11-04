const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb://localhost:27017/careerNest'; 

async function generateModels() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB successfully');

        const db = client.db('careerNest');

        const modelsDir = path.join(__dirname, 'models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir);
        }

        const collections = await db.listCollections().toArray();

        for (const collectionInfo of collections) {
            const collection = db.collection(collectionInfo.name);
            const sampleDoc = await collection.findOne();

            if (sampleDoc) {
                const schemaString = generateSchemaString(collectionInfo.name, sampleDoc);

                const filePath = path.join(modelsDir, `${capitalize(collectionInfo.name)}.js`);
                fs.writeFileSync(filePath, schemaString, 'utf8');
                console.log(`Generated model for collection '${collectionInfo.name}' at ${filePath}`);
            } else {
                console.log(`No documents found in collection '${collectionInfo.name}', skipping...`);
            }
        }

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
    } finally {
        await client.close();
    }
}

function generateSchemaString(collectionName, sampleDoc) {
    let schemaDefinition = '{\n';

    for (const [key, value] of Object.entries(sampleDoc)) {
        const type = inferType(value);
        schemaDefinition += `  ${key}: { type: ${type} },\n`;
    }

    schemaDefinition += '}';

    return `
const mongoose = require('mongoose');

const ${capitalize(collectionName)}Schema = new mongoose.Schema(${schemaDefinition});

const ${capitalize(collectionName)} = mongoose.model('${capitalize(collectionName)}', ${capitalize(collectionName)}Schema);

module.exports = ${capitalize(collectionName)};
`;
}

function inferType(value) {
    switch (typeof value) {
        case 'string': return 'String';
        case 'number': return 'Number';
        case 'boolean': return 'Boolean';
        case 'object':
            if (value instanceof Date) return 'Date';
            return 'Object';
        default: return 'String';
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

generateModels();
