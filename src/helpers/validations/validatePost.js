/**
 * This function validates the Signup data.
 *
 * @param {author, title, content, image, tag} data
 */

const { ValidationError } = require("../../customErrors");

module.exports = (data) => {
    const regex = {
        title: /^[a-zA-Z-0-9\.\_\!\@\#\$\%\&\*\'\s]{3,30}$/,
        content: /^[\w\-\_\.\*\$\#\@\%\&\^\(\)\=\+\!\?\/\s]+$/,
        image: /^[a-zA-Z-0-9\_\s]{36}?\.(png|jpg|jpeg|webp|bmp|gif)$/,
        tag: /^[a-zA-Z0-9\+ ]{1,20}$/,
    };
    for (var x in regex) {
        if (!regex[x].test(data[x])) {
            throw new ValidationError(
                `Data validation failed for ${x}, value = ${data[x]}`
            );
        }
    }
};
