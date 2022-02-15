/**
 * This function validates the Signin data.
 *
 * @param {username, password} data
 */

const { ValidationError } = require("../../customErrors");

module.exports = (data) => {
    const regex = {
        username: /^[a-zA-Z0-9\-\_\.]+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
        password: /^[a-zA-Z0-9\.\_\!\@\#\$\%\&\*\']{5,30}$/,
    };
    for (var x in regex) {
        if (!regex[x].test(data[x])) {
            throw new ValidationError(
                `Data validation failed for ${x}, value = ${data[x]}`
            );
        }
    }
};
