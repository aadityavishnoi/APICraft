const mongoose = require("mongoose");
const Collection = require("../models/Collection");

// CAT1-A: Compute isolated physical MongoDB collection name per user
const getPhysicalName = (config) => `${config.userId}_${config.collectionName}`;

// CAT4-C: Maximum documents per collection
const MAX_DOCUMENTS_PER_COLLECTION = 10000;


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

    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const incomingFields = Object.keys(req.body);

    // CAT4-B: Block MongoDB operator injection via field names
    for (let key of incomingFields) {
      if (key.startsWith('$') || key.includes('.')) {
        return res.status(400).json({
          message: "Field names cannot start with '$' or contain '.'"
        });
      }
    }

    const invalidFields = incomingFields.filter(
      field => !allowedFieldNames.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid Fields!",
        invalidFields
      });
    }

    for (let key of incomingFields) {
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        return res.status(400).json({
          message: "Nested objects are not allowed in this dynamic collection."
        });
      }
      if (typeof req.body[key] === 'string' && req.body[key].length > 5000) {
        return res.status(400).json({
          message: "Field value exceeds maximum length of 5000 characters."
        });
      }
    }

    const Model = mongoose.connection.collection(getPhysicalName(config));

    // CAT4-C: Check document count cap
    const docCount = await Model.countDocuments();
    if (docCount >= MAX_DOCUMENTS_PER_COLLECTION) {
      return res.status(429).json({
        message: `Document limit of ${MAX_DOCUMENTS_PER_COLLECTION} reached for this collection`
      });
    }

    const result = await Model.insertOne(req.body);

    res.json({
      message: "Data Inserted Successfully!",
      result
    });

  } catch (error) {
    console.error("[createData]", error.message);
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

    const Model = mongoose.connection.collection(getPhysicalName(config));

    // CAT3-E: Only return fields defined in the current schema
    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const projection = { _id: 1 };
    allowedFieldNames.forEach(f => { projection[f] = 1; });

    const data = await Model.find({}, { projection }).toArray();

    res.json(data);

  } catch (error) {
    console.error("[getData]", error.message);
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
    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const incomingFields = Object.keys(req.body);

    // CAT4-B: Block MongoDB operator injection via field names
    for (let key of incomingFields) {
      if (key.startsWith('$') || key.includes('.')) {
        return res.status(400).json({
          message: "Field names cannot start with '$' or contain '.'"
        });
      }
    }

    const invalidFields = incomingFields.filter(
      field => !allowedFieldNames.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: "Invalid Fields!",
        invalidFields
      });
    }

    for (let key of incomingFields) {
      if (typeof req.body[key] === 'object' && req.body[key] !== null) {
        return res.status(400).json({
          message: "Nested objects are not allowed in this dynamic collection."
        });
      }
      if (typeof req.body[key] === 'string' && req.body[key].length > 5000) {
        return res.status(400).json({
          message: "Field value exceeds maximum length of 5000 characters."
        });
      }
    }

    // ObjectId validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID"
      });
    }

    const Model = mongoose.connection.collection(getPhysicalName(config));

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
    console.error("[updateData]", error.message);
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

    const Model = mongoose.connection.collection(getPhysicalName(config));

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
    console.error("[deleteData]", error.message);
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
