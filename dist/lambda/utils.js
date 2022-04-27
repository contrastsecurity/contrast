"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportedForTesting = exports.prettyPrintResults = exports.toLowerKeys = void 0;
const chalk_1 = __importDefault(require("chalk"));
const lodash_1 = require("lodash");
const logUtils_1 = require("./logUtils");
const groupByCVE = ({ title }) => title.substring(0, title.indexOf('[') - 1);
const groupByDependency = ({ title }) => title.substring(title.indexOf('[') + 1, title.indexOf(']'));
const prettyPrintResults = (results) => {
    (0, logUtils_1.log)('');
    const vulnerabs = results.filter(r => r.category === 1 || r.category === 4);
    const sortBySeverity = (0, lodash_1.sortBy)(vulnerabs, ['severity', 'title']);
    const notDependencies = sortBySeverity.filter(r => r.category !== 1);
    const dependencies = sortBySeverity.filter(r => r.category === 1);
    const dependenciesByLibrary = (0, lodash_1.groupBy)(dependencies, groupByDependency);
    const dependenciesCount = Object.keys(dependenciesByLibrary).length;
    notDependencies.forEach(printVulnerability);
    const prevIndex = notDependencies.length + 1;
    Object.entries(dependenciesByLibrary).forEach(([library, group], i) => {
        const maxSeverity = (0, lodash_1.minBy)(group, 'severity');
        const allCves = group.map(groupByCVE);
        (0, logUtils_1.log)(prevIndex + i);
        (0, logUtils_1.log)(`${chalk_1.default.bold((0, lodash_1.capitalize)(maxSeverity.severityText))} | ${chalk_1.default.bold('Vulnerable dependency')} ${library} has ${group.length} known CVEs`);
        (0, logUtils_1.log)(allCves.join(', '));
        if (maxSeverity.remediation?.description) {
            (0, logUtils_1.log)(`${chalk_1.default.bold('Recommendation:')} ${maxSeverity.remediation.description}`);
        }
        (0, logUtils_1.log)('');
    });
    const resultCount = notDependencies.length + dependenciesCount;
    const groupByType = (0, lodash_1.groupBy)(notDependencies, ['categoryText']);
    const summary = Object.values(groupByType).map(group => `${group.length} ${(0, lodash_1.capitalize)(group[0].categoryText)}`);
    (0, logUtils_1.log)(`Found ${resultCount} vulnerabilities`, { bold: true });
    summary.push(`${dependenciesCount} Dependencies`);
    (0, logUtils_1.log)(chalk_1.default.bold(summary.join(' | ')));
};
exports.prettyPrintResults = prettyPrintResults;
const underlineLinks = (text) => {
    if (!text) {
        return text;
    }
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, chalk_1.default.underline('$1'));
};
const printVulnerability = (vulnerability, index) => {
    (0, logUtils_1.log)(index + 1);
    const descriptionWithLinks = underlineLinks(vulnerability.description);
    (0, logUtils_1.log)(`${chalk_1.default.bold((0, lodash_1.capitalize)(vulnerability.severityText))} | ${chalk_1.default.bold(vulnerability.title)} ${descriptionWithLinks}`);
    const category = vulnerability?.categoryText;
    switch (category) {
        case 'PERMISSIONS':
            printLeastPrivilegeRemediation(vulnerability);
            break;
        default:
            printRemediation(vulnerability);
    }
    (0, logUtils_1.log)('');
};
const printLeastPrivilegeRemediation = (vulnerability) => {
    (0, logUtils_1.log)(`${chalk_1.default.bold('Recommendation:')} Replace the existing policies with the following`);
    const violatingPolicies = vulnerability?.evidence?.leastPrivilege?.violatingPolicies || [];
    violatingPolicies
        .filter((vp) => vp?.suggestedPolicy?.suggestedPolicyCode?.length)
        .map((vp) => vp?.suggestedPolicy?.suggestedPolicyCode)
        .forEach((policies) => {
        policies.forEach((policy) => {
            console.log(policy.snippet);
        });
    });
};
const printRemediation = (vulnerability) => {
    (0, logUtils_1.log)(`Remediation - ${vulnerability?.remediation?.description || 'Unknown'}`);
};
function toLowerKeys(obj) {
    return Object.keys(obj).reduce((accumulator, key) => {
        const new_key = `${key[0].toLowerCase()}${key.slice(1)}`;
        accumulator[new_key] = obj[key];
        return accumulator;
    }, {});
}
exports.toLowerKeys = toLowerKeys;
exports.exportedForTesting = {
    printLeastPrivilegeRemediation,
    printRemediation,
    printVulnerability,
    underlineLinks
};
