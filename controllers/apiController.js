const mongoose = require("mongoose");
const Collection = require("../models/Collection");
const ApiLog = require("../models/ApiLog");

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
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A collection with this name already exists"
            });
        }
        console.error("[createCollection]", error.message);
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
        console.error("[getCollection]", error.message);
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

        // ITEM 4: Drop actual data
        const internalName = `uc_${req.user.id}_${collectionName}`;
        try {
            await mongoose.connection.dropCollection(internalName);
        } catch (e) {
            // collection may not exist yet if no data was inserted — ignore
            if (e.codeName !== 'NamespaceNotFound') throw e;
        }

        res.json({
            message: "Collection Deleted Successfully"
        });
    } catch (error) {
        console.error("[deleteCollection]", error.message);
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
        console.error("[updateCollection]", error.message);
        res.status(500).json({
            message: "Update Failed."
        });
    }
};

const getApiLogs = async (req, res) => {
  try {
    const { collection, method, status, limit } = req.query;
    
    let query = { userId: req.user.id };
    
    if (collection && collection !== 'ALL') query.collectionName = collection;
    if (method && method !== 'ALL') query.method = method;
    if (status && status !== 'ALL') {
        if (status === '2xx') query.status = { $gte: 200, $lt: 300 };
        else if (status === '4xx') query.status = { $gte: 400, $lt: 500 };
        else if (status === '5xx') query.status = { $gte: 500, $lt: 600 };
    }

    let limitNum = parseInt(limit, 10);
    if (isNaN(limitNum)) limitNum = 50;

    const logs = await ApiLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching logs" });
  }
};

const getLogStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const totalCollections = await Collection.countDocuments({ userId });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const totalCalls30d = await ApiLog.countDocuments({ userId, createdAt: { $gte: thirtyDaysAgo } });
    
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    const failedCalls24h = await ApiLog.countDocuments({ userId, createdAt: { $gte: twentyFourHoursAgo }, status: { $gte: 400 } });
    
    const User = require("../models/User");
    const user = await User.findById(userId);
    const activeKeys = user && Array.isArray(user.apiKeys) ? user.apiKeys.filter(k => !k.revoked).length : 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await ApiLog.find({ userId, createdAt: { $gte: sevenDaysAgo } });
    
    const lineChart = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        lineChart[dateStr] = 0;
    }
    
    const doughnutChart = {};
    const barChart = { '2xx': 0, '4xx': 0, '5xx': 0 };
    
    for (let log of recentLogs) {
        const dateStr = new Date(log.createdAt).toISOString().split('T')[0];
        if (lineChart[dateStr] !== undefined) lineChart[dateStr]++;
        
        doughnutChart[log.collectionName] = (doughnutChart[log.collectionName] || 0) + 1;
        
        if (log.status >= 200 && log.status < 300) barChart['2xx']++;
        else if (log.status >= 400 && log.status < 500) barChart['4xx']++;
        else if (log.status >= 500) barChart['5xx']++;
    }
    
    const lineChartData = Object.keys(lineChart).sort().map(date => ({ date, calls: lineChart[date] }));
    const doughnutChartData = Object.keys(doughnutChart).map(name => ({ name, value: doughnutChart[name] }));
    const barChartData = Object.keys(barChart).map(name => ({ name, value: barChart[name] }));
    
    res.json({
        stats: { totalCollections, totalCalls30d, activeKeys, failedCalls24h },
        charts: { lineChartData, doughnutChartData, barChartData }
    });
  } catch (error) {
    console.error("[getLogStats]", error.message);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

const generateDocs = async (req, res) => {
    try {
        const collections = await Collection.find({
            userId: req.user.id
        });

        const docs = collections.map(col => ({
            collection: col.collectionName,
            endpoints: {
                create: `POST /api/${col.collectionName}`,
                get: `GET /api/${col.collectionName}`,
                update: `PUT /api/${col.collectionName}/:id`,
                delete: `DELETE /api/${col.collectionName}/:id`
            },
            fields: col.fields
        }));

        res.json(docs);
    } catch (error) {
        console.error("[generateDocs]", error.message);
        res.status(500).json({
            message: "Error generating docs"
        });
    }
};

module.exports = { createCollection, getCollection, deleteCollection, updateCollection, getApiLogs, getLogStats, generateDocs };