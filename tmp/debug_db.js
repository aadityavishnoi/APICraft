const mongoose = require('mongoose');
require('dotenv').config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections in DB:");
        for (const col of collections) {
            if (col.name.startsWith('uc_')) {
                const count = await mongoose.connection.db.collection(col.name).countDocuments();
                console.log(` - ${col.name}: ${count} documents`);
            }
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debug();
