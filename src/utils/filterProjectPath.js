const path = require('path')
const child_process = require('child_process')

function resolveFilePath(filepath) {
  if (filepath[0] === '~') {
    return path.join(process.env.HOME, filepath.slice(1))
  }
  return filepath
}

const returnProjectPath = () => {
  if (process.platform == 'win32') {
    let winPath = child_process.execSync('cd').toString()
    return winPath.replace(/\//g, '\\').trim()
  } else if (process.env.PWD !== (undefined || null || 'undefined')) {
    return process.env.PWD
  } else {
    return process.argv[process.argv.indexOf('--file') + 1]
  }
}

module.exports = {
  returnProjectPath: returnProjectPath,
  resolveFilePath: resolveFilePath
}
