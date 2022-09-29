const fs = require('fs')
const yarnParser = require('@yarnpkg/lockfile')
const yaml = require('js-yaml')
const i18n = require('i18n')
const {
  formatKey
} = require('../../audit/nodeAnalysisEngine/parseYarn2LockFileContents')

const readFile = async (config, languageFiles, nameOfFile) => {
  const index = languageFiles.findIndex(v => v.includes(nameOfFile))

  if (config.file) {
    return fs.readFileSync(config.file.concat(languageFiles[index]), 'utf8')
  } else {
    throw new Error('could not find file')
  }
}

const readYarn = async (config, languageFiles, nameOfFile) => {
  let yarn = {
    yarnVersion: 1,
    rawYarnLockFileContents: ''
  }

  try {
    let rawYarnLockFileContents = await readFile(
      config,
      languageFiles,
      nameOfFile
    )
    yarn.rawYarnLockFileContents = rawYarnLockFileContents

    if (
      !yarn.rawYarnLockFileContents.includes('lockfile v1') ||
      yarn.rawYarnLockFileContents.includes('__metadata')
    ) {
      yarn.rawYarnLockFileContents = yaml.load(rawYarnLockFileContents)
      yarn.yarnVersion = 2
    }

    return yarn
  } catch (err) {
    throw new Error(i18n.__('nodeReadYarnLockFileError') + `${err.message}`)
  }
}

const parseNpmLockFile = async js => {
  try {
    js.npmLockFile = JSON.parse(js.rawLockFileContents)
    if (js.npmLockFile && js.npmLockFile.lockfileVersion > 1) {
      const listOfTopDep = Object.keys(js.npmLockFile.dependencies)
      Object.entries(js.npmLockFile.dependencies).forEach(([objKey, value]) => {
        if (value.requires) {
          const listOfRequiresDep = Object.keys(value.requires)
          listOfRequiresDep.forEach(dep => {
            if (!listOfTopDep.includes(dep)) {
              addDepToLockFile(js, value['requires'], dep)
            }
          })
        }

        if (value.dependencies) {
          Object.entries(value.dependencies).forEach(
            ([objChildKey, childValue]) => {
              if (childValue.requires) {
                const listOfRequiresDep = Object.keys(childValue.requires)
                listOfRequiresDep.forEach(dep => {
                  if (!listOfTopDep.includes(dep)) {
                    addDepToLockFile(js, childValue['requires'], dep)
                  }
                })
              }
            }
          )
        }
      })
      return js.npmLockFile
    } else {
      return js.npmLockFile
    }
  } catch (err) {
    throw new Error(i18n.__('NodeParseNPM') + `${err.message}`)
  }
}

const addDepToLockFile = (js, depObj, key) => {
  return (js.npmLockFile.dependencies[key] = { version: depObj[key] })
}
const parseYarnLockFile = async js => {
  try {
    js.yarn.yarnLockFile = {}
    if (js.yarn.yarnVersion === 1) {
      js.yarn.yarnLockFile = yarnParser.parse(js.yarn.rawYarnLockFileContents)
      delete js.yarn.rawYarnLockFileContents
      return js
    } else {
      js.yarn.yarnLockFile['object'] = js.yarn.rawYarnLockFileContents
      delete js.yarn.yarnLockFile['object'].__metadata
      js.yarn.yarnLockFile['type'] = 'success'

      Object.entries(js.yarn.rawYarnLockFileContents).forEach(
        ([key, value]) => {
          const rawKeyNames = key.split(',')
          const keyNames = formatKey(rawKeyNames)

          keyNames.forEach(name => {
            js.yarn.yarnLockFile.object[name] = value
          })
        }
      )
      return js
    }
  } catch (err) {
    throw new Error(
      i18n.__('NodeParseYarn', js.yarn.yarnVersion) + `${err.message}`
    )
  }
}

module.exports = {
  readYarn,
  parseYarnLockFile,
  parseNpmLockFile,
  readFile,
  formatKey
}
