const { get } = require("mongoose");
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

const getCollection = async (req, res) => {
    try {
        const collection = await Collection.find({
            userId: req.user.id
        });

        res.json(collection);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error Fetching Collections"
        });
    }
};

const deleteCollection = async(req, res) => {
    try {
        const collectionName = req.params.name;

        await Collection.deleteOne({
            collectionName,
            userId: req.user.id
        });

        res.json({
            message: "Collection Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Delete Failed"
        });
    }
};

const updateCollection = async(req, res) => {
    try{
    const collectionName = req.params.name;

    const updated = await Collection.findOneAndUpdate(
        {
            collectionName,
            userId: req.user.id
        },
        {
            fields: req.body.fields
        },
        {
            new: true
        }
    );

    res.json(updated);
} catch(error){
console.log(error);
res.status(500).json({
    message: "Update Failed."
});
}
};
module.exports = { createCollection, getCollection, deleteCollection, updateCollection };