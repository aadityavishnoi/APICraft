const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'apicraft-ce0a0' });

async function run() {
    try {
        const user = await admin.auth().getUserByEmail('contactechyy@gmail.com');
        console.log("User:", user.uid);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
run();
