const Joi = require("joi");

const validateCollection = (req, res, next) => {
  const schema = Joi.object({
    collectionName: Joi.string().required(),
    fields: Joi.array().items(Joi.string()).required()
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message
    });
  }

  next();
};

module.exports = validateCollection;
