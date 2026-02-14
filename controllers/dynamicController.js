const mongoose = require("mongoose");
const Collection = require("../models/Collection");


// CREATE DATA
const createData = async (req, res) => {
  try {
    const collection = req.params.collection;

    const config = await Collection.findOne({
      collectionName: collection,
      userId: req.user.id
    });

    if (!config) {
      return res.status(404).json({
        message: "Collection Not Found!"
      });
    }

    const allowedFields = config.fields;
    const incomingFields = Object.keys(req.body);

    const invalidFields = incomingFields.filter(
      field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid Fields!",
        invalidFields
      });
    }

    const Model = mongoose.connection.collection(config.collectionName);

    const result = await Model.insertOne(req.body);

    res.json({
      message: "Data Inserted Successfully!",
      result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Insert Failed"
    });
  }
};


// GET DATA
const getData = async (req, res) => {
  try {
    const collection = req.params.collection;

    const config = await Collection.findOne({
      collectionName: collection,
      userId: req.user.id
    });

    if (!config) {
      return res.status(404).json({
        message: "Collection Not Found!"
      });
    }

    const Model = mongoose.connection.collection(config.collectionName);

    const data = await Model.find().toArray();

    res.json(data);

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Fetching Data!"
    });
  }
};


// UPDATE DATA
const updateData = async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;

    const config = await Collection.findOne({
      collectionName: collection,
      userId: req.user.id
    });

    if (!config) {
      return res.status(404).json({
        message: "Collection Not Found!"
      });
    }

    // Field validation
    const allowedFields = config.fields;
    const incomingFields = Object.keys(req.body);

    const invalidFields = incomingFields.filter(
      field => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid Fields!",
        invalidFields
      });
    }

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID"
      });
    }

    const Model = mongoose.connection.collection(config.collectionName);

    const result = await Model.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: req.body }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    res.json({
      message: "Data Updated Successfully!",
      result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Update Failed"
    });
  }
};


// DELETE DATA
const deleteData = async (req, res) => {
  try {
    const collection = req.params.collection;
    const id = req.params.id;

    const config = await Collection.findOne({
      collectionName: collection,
      userId: req.user.id
    });

    if (!config) {
      return res.status(404).json({
        message: "Collection Not Found!"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID"
      });
    }

    const Model = mongoose.connection.collection(config.collectionName);

    const result = await Model.deleteOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    res.json({
      message: "Data Deleted Successfully!",
      result
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Delete Failed"
    });
  }
};


module.exports = {
  createData,
  getData,
  updateData,
  deleteData
};
