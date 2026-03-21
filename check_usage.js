const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const User = require('./models/User');

async function checkUser() {
    try {
        console.log('Connecting to Mongo...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');
        
        const email = 'contactechyy@gmail.com';
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`No user found with email: ${email}`);
            const allUsers = await User.find({}, { email: 1 });
            console.log('Available emails:', allUsers.map(u => u.email));
        } else {
            console.log('User data:', {
                _id: user._id,
                name: user.name,
                email: user.email,
                usageCount: user.usageCount,
                usageLimit: user.usageLimit
            });
        }
        process.exit(0);
    } catch (err) {
        console.error('ERROR OCCURRED:');
        console.error(err);
        process.exit(1);
    }
}

checkUser();
