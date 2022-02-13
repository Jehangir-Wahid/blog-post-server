/**
 * This function validates the Signup data.
 *
 * @param {username, password, name, picture} data
 */

const { ValidationError } = require("../../customErrors");

module.exports = (data) => {
    const regex = {
        name: /^[a-zA-Z ]{3,30}$/,
        author_avatar: /^[a-zA-Z-0-9\_\s]{36}?\.[a-z]{3,4}$/,
    };
    for (var x in regex) {
        if (!regex[x].test(data[x])) {
            throw new ValidationError(
                `Data validation failed for ${x}, value = ${data[x]}`
            );
        }
    }
};
