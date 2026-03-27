const mongoose = require('mongoose');
const Collection = require('./models/Collection');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const users = await User.find().limit(2);
        if(users.length < 2) {
            console.log('Need 2 users to test');
            process.exit(0);
        }
        const user1 = users[0];
        const user2 = users[1];
        
        await Collection.deleteMany({ collectionName: 'test_col' });

        await Collection.create({ userId: user1._id, collectionName: 'test_col', fields: ['name:String:REQ'] });
        console.log('User 1 created test_col');
        
        await Collection.create({ userId: user2._id, collectionName: 'test_col', fields: ['name:String:REQ'] });
        console.log('User 2 created test_col');
        
        console.log('Successfully created both!');
    } catch (e) {
        console.error('Error creating:', e.message);
    }
    process.exit(0);
});
