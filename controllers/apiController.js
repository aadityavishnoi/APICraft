const Collection = require("../models/Collection");

const createCollection = async (req, res) => {
    try {
        const { collectionName, fields } = req.body;

        const collection = new Collection({
            userId: req.user.id,
            collectionName,
            fields
        });
        await collection.save();

        res.json({
           message: "Collection Created Successfully!"
        });

    } catch (error) {
        console.log(error),
        res.status(500).json({
            message: "Failed To Create Collection! Server Error."
        });
    }
};

module.exports = { createCollection };