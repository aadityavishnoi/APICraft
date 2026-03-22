const Joi = require("joi");

const RESERVED_NAMES = new Set([
    'auth', 'collections', 'keys', 'api-logs', 'logs', 'api-docs',
    'create-collection', 'system', 'admin', 'local', 'config',
    '__proto__', 'constructor', 'prototype'
]);

const validateCollection = (req, res, next) => {
  const schema = Joi.object({
    collectionName: Joi.string()
        .required()
        .pattern(/^[a-z][a-z0-9-]{1,48}[a-z0-9]$/)
        .messages({
            'string.pattern.base':
                'Collection name must be 3-50 chars, lowercase alphanumeric + hyphens, start with a letter'
        }),
    // CAT4-C: Limit max fields per collection to 50
    fields: Joi.array().items(Joi.string()).required().max(50)
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  // CAT3-C / CAT4-A: Block reserved and dangerous collection names
  if (RESERVED_NAMES.has(req.body.collectionName)) {
      return res.status(400).json({ message: "This collection name is reserved" });
  }

  next();
};

module.exports = validateCollection;
