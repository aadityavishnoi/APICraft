const Joi = require("joi");

const RESERVED_NAMES = new Set([
    'auth', 'collections', 'keys', 'api-logs', 'logs', 'api-docs',
    'create-collection', 'system', 'admin', 'local', 'config',
    '__proto__', 'constructor', 'prototype'
]);

const validateCollection = (req, res, next) => {
  const schema = Joi.object({
    // ITEM 10: Server-side validation for collection names 
    collectionName: Joi.string()
        .pattern(/^[a-z0-9][a-z0-9_-]{0,48}[a-z0-9]$/)
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.pattern.base': 'Collection name must be lowercase letters, numbers, underscores, or hyphens only'
        }),
    fields: Joi.array().items(Joi.string()).required().max(50)
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  if (RESERVED_NAMES.has(req.body.collectionName)) {
      return res.status(400).json({ message: "This collection name is reserved" });
  }

  next();
};

module.exports = validateCollection;
