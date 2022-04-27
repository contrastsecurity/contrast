"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prettyPrintJson = exports.log = void 0;
const chalk_1 = __importDefault(require("chalk"));
const util_1 = __importDefault(require("util"));
const log = (message, styles) => {
    let chalkFunction = chalk_1.default.reset;
    if (styles?.bold) {
        chalkFunction = chalk_1.default.bold;
    }
    else if (styles?.italic) {
        chalkFunction = chalk_1.default.italic;
    }
    else if (styles?.underline) {
        chalkFunction = chalk_1.default.underline;
    }
    else if (styles?.strikethrough) {
        chalkFunction = chalk_1.default.strikethrough;
    }
    console.log(styles ? chalkFunction(message) : message);
};
exports.log = log;
const prettyPrintJson = (obj, depth = null) => {
    if (!obj) {
        return;
    }
    let objToPrint = obj;
    if (typeof obj === 'string') {
        objToPrint = JSON.parse(obj);
    }
    console.log(util_1.default.inspect(objToPrint, { colors: true, depth }));
};
exports.prettyPrintJson = prettyPrintJson;
