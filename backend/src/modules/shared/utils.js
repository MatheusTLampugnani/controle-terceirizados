const { z } = require('zod');

function getZodErrorMessage(error) {
    if (error instanceof z.ZodError) {
        return error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    }
    return error.message;
}

module.exports = { getZodErrorMessage };
