"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const response_1 = require("../utils/response");
function validate(schemas) {
    return (req, res, next) => {
        const errors = {};
        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                errors.body = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
            }
            else {
                req.body = result.data;
            }
        }
        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                errors.query = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
            }
            else {
                req.query = result.data;
            }
        }
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                errors.params = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
            }
        }
        if (Object.keys(errors).length > 0) {
            (0, response_1.sendError)(res, "Validation failed", 400, errors);
            return;
        }
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map