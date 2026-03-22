const Joi = require("joi");

// CAT4-D: Input validation for auth endpoints to prevent NoSQL injection

const validateSignup = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().trim().min(1).max(100).required(),
        email: Joi.string().email().max(254).required(),
        password: Joi.string().min(8).max(128).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });
    next();
};

module.exports = { validateSignup, validateLogin };
