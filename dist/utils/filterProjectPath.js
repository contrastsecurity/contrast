"use strict";
const path = require('path');
function resolveFilePath(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
    }
    return filepath;
}
const returnProjectPath = () => {
    if (process.env.PWD !== (undefined || null || 'undefined')) {
        return process.env.PWD;
    }
    else {
        return process.argv[process.argv.indexOf('--project_path') + 1];
    }
};
module.exports = {
    returnProjectPath: returnProjectPath,
    resolveFilePath: resolveFilePath
};
