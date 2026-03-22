const mongoose = require("mongoose");
const Collection = require("../models/Collection");

// ITEM 3: Internal namespace collision fix
function getMongoCollectionName(userId, collectionName) {
  return `uc_${userId}_${collectionName}`;
}

const MAX_DOCUMENTS_PER_COLLECTION = 10000;

function sanitizeData(body) {
    const clean = {};
    for (const [k, v] of Object.entries(body)) {
      if (k.startsWith('$')) continue; // strip operator keys
      if (v !== null && typeof v === 'object') continue; // strip nested objects
      clean[k] = v;
    }
    return clean;
}

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

    // ITEM 13: Enforce required fields
    const requiredFields = config.fields
      .filter(f => f.split(':')[2] === 'REQ')
      .map(f => f.split(':')[0]);

    const missingRequired = requiredFields.filter(
      f => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );

    if (missingRequired.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields.',
        missingFields: missingRequired
      });
    }

    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const incomingFields = Object.keys(req.body);

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
      const val = req.body[key];
      if (key.startsWith('$') || (val !== null && typeof val === 'object')) {
        return res.status(400).json({
          message: "Nested objects or operator keys are not allowed."
        });
      }
      if (typeof val === 'string' && val.length > 5000) {
        return res.status(400).json({
          message: "Field value exceeds maximum length of 5000 characters."
        });
      }
    }

    // ITEM 11: Sanitize against NoSQL injection
    const sanitizedBody = sanitizeData(req.body);

    // ITEM 3: Use namespaced physical name
    const Model = mongoose.connection.collection(getMongoCollectionName(config.userId.toString(), config.collectionName));

    const docCount = await Model.estimatedDocumentCount();
    if (docCount >= MAX_DOCUMENTS_PER_COLLECTION) {
      return res.status(429).json({
        message: `Document limit of ${MAX_DOCUMENTS_PER_COLLECTION} reached for this collection`
      });
    }

    const result = await Model.insertOne(sanitizedBody);

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

    // ITEM 3: Use namespaced physical name
    const Model = mongoose.connection.collection(getMongoCollectionName(config.userId.toString(), config.collectionName));

    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const projection = { _id: 1 };
    allowedFieldNames.forEach(f => { projection[f] = 1; });

    // ITEM 12: Add Pagination
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Model.find({}, { projection }).skip(skip).limit(limit).toArray(),
      Model.countDocuments()
    ]);

    res.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("[getData]", error.message);
    res.status(500).json({
      message: "Error Fetching Data!"
    });
  }
};

const getSingleData = async (req, res) => {
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

    const Model = mongoose.connection.collection(getMongoCollectionName(config.userId.toString(), config.collectionName));

    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const projection = { _id: 1 };
    allowedFieldNames.forEach(f => { projection[f] = 1; });

    const result = await Model.findOne({ _id: new mongoose.Types.ObjectId(id) }, { projection });

    if (!result) {
      return res.status(404).json({
        message: "Document not found"
      });
    }

    res.json({
      data: result
    });

  } catch (error) {
    console.error("[getSingleData]", error.message);
    res.status(500).json({
      message: "Error Fetching Data!"
    });
  }
};

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

    const allowedFieldNames = config.fields.map(f => f.split(':')[0]);
    const incomingFields = Object.keys(req.body);

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
      const val = req.body[key];
      if (key.startsWith('$') || (val !== null && typeof val === 'object')) {
        return res.status(400).json({
          message: "Nested objects or operator keys are not allowed."
        });
      }
      if (typeof val === 'string' && val.length > 5000) {
        return res.status(400).json({
          message: "Field value exceeds maximum length of 5000 characters."
        });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID"
      });
    }

    // ITEM 11: Sanitize against NoSQL injection
    const sanitizedBody = sanitizeData(req.body);

    // ITEM 3: Use namespaced physical name
    const Model = mongoose.connection.collection(getMongoCollectionName(config.userId.toString(), config.collectionName));

    const result = await Model.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: sanitizedBody }
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

    // ITEM 3: Use namespaced physical name
    const Model = mongoose.connection.collection(getMongoCollectionName(config.userId.toString(), config.collectionName));

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
  getSingleData,
  updateData,
  deleteData
};
