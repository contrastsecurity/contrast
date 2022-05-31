const whitespaceRegx = /^(\s*)/
let index = 0
const depReg = /^\s*([A-Za-z0-9.!@#$%\-^&*_+]*)\s*(\((.*?)\))/
const i18n = require('i18n')

const GEMFILE_KEY_VALUE = /^\s*([^:(]*)\s*\:*\s*(.*)/ // eslint-disable-line
let rubyObj = {}
rubyObj.dependencies = {}

module.exports = exports = ({ ruby }, next) => {
  const { rawLockFileContents } = ruby
  let lines = rawLockFileContents.split('\n')

  try {
    ruby.gemfileLock = {}
    getDirectDepencies(lines, ruby.gemfileLock)
    getRubyVersion(lines, ruby.gemfileLock)
    getSourceArr(lines, ruby.gemfileLock)
    next()
  } catch (err) {
    next(
      new Error(
        i18n.__('rubyAnalysisEngineParsedGemLockFileError') + `${err.message}`
      )
    )
  }
}

const populateSourceType = (line, rubyObj) => {
  // sourceType has 0 WS and isn't null
  return (rubyObj.sourceType = line)
}

const nonDependencyKeys = (line, rubyObj) => {
  let parts = GEMFILE_KEY_VALUE.exec(line)
  let key = parts[1].trim()
  let value = parts[2] || ''
  return (rubyObj[key] = value)
}

const populateResolveAndPlatform = (dependency, rubyObj) => {
  const depArr = dependency.split('-')
  rubyObj.resolved = depArr[0]
  rubyObj.platform = depArr.length > 1 ? depArr[1] : 'UNSPECIFIED'
  return rubyObj
}

const isUpperCase = str => {
  return str === str.toUpperCase()
}

const getDirectDepencies = (lines, ruby) => {
  let depIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] == 'DEPENDENCIES') {
      depIndex = i
    }
  }
  const getDepArray = lines.slice(depIndex)

  ruby.dependencies = {}

  for (let j = 1; j < getDepArray.length; j++) {
    const element = getDepArray[j]
    if (!isUpperCase(element)) {
      const isDependencyWithVersion = depReg.test(element)
      if (isDependencyWithVersion) {
        const dependency = depReg.exec(element)
        // BF bain!
        let name = dependency[1]
        name = name.replace('!', '')
        //
        ruby.dependencies[name.trim()] = dependency[3]
      } else {
        // BF bain!
        let name = element
        name = name.replace('!', ' ')
        //
        ruby.dependencies[name.trim()] = 'UNSPECIFIED'
      }
    } else {
      return
    }
  }
}

const getRubyVersion = (lines, ruby) => {
  let rubVersionIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] == 'RUBY VERSION') {
      rubVersionIndex = i
      break
    }
  }
  if (rubVersionIndex !== 0) {
    const getRubyVersionArray = lines.slice(rubVersionIndex)

    ruby.runtimeDetails = {}

    for (let j = 1; j < getRubyVersionArray.length; j++) {
      let element = getRubyVersionArray[j]
      if (!isUpperCase(element)) {
        element = element.trim()
        if (/^([ruby\s0-9.*]+)/.test(element)) {
          let splitElement = element.split(' ')
          ruby.runtimeDetails['version'] = splitElement[1]
        }

        if (/^([p0-9]+)/.test(element)) {
          ruby.runtimeDetails['patchLevel'] = element.substring(1)
        }
        if (element.includes('engine')) {
          let splitElement = element.split(' ')
          ruby.runtimeDetails[splitElement[0]] = splitElement[1]
        }
      } else {
        return
      }
    }
  }
}

const formatSourceArr = sourceArr => {
  return sourceArr.map(element => {
    if (element.sourceType === 'GIT') {
      delete element.specs
    }
    if (element.sourceType === 'GEM') {
      delete element.branch
      delete element.revision
      delete element.depthLevel
      delete element.specs
    }
    if (element.sourceType === 'PATH') {
      delete element.branch
      delete element.revision
      delete element.depthLevel
      delete element.specs
      delete element.platform
    }
    return element
  })
}

const getSourceArr = (lines, ruby) => {
  let line = 0
  let source = []
  while ((line = lines[index++]) !== undefined) {
    let currentWS = whitespaceRegx.exec(line)[1].length
    // BF bain!
    if (!line.includes(' bundler (')) {
      // populates sourceType
      if (currentWS === 0 && !line.includes(':') && line != '') {
        populateSourceType(line, rubyObj)
      }

      // gets top level keys
      if (currentWS !== 0 && line.includes(':')) {
        nonDependencyKeys(line, rubyObj)
      }

      // dep can be parent at 4WS or edge at 6 WS
      if (currentWS > 2) {
        const isDependencyWithVersion = depReg.test(line)

        let nexlineWS = whitespaceRegx.exec(lines[index])[1].length
        // means its an edge
        if (currentWS === 6) {
          const dependency = depReg.exec(line)
          if (isDependencyWithVersion) {
            if (rubyObj.name !== dependency[1]) {
              rubyObj.dependencies[dependency[1]] = dependency[3]
            }
          } else {
            rubyObj.dependencies[line.trim()] = 'UNSPECIFIED'
          }
        }

        if (currentWS === 4 && rubyObj.depthLevel === undefined) {
          const dependency = depReg.exec(line)
          rubyObj.name = dependency[1]
          rubyObj.depthLevel = currentWS
          populateResolveAndPlatform(dependency[3], rubyObj)
        }

        // when dethlevel is defined and WS is 4 then its a new dep
        if (currentWS === 4 && rubyObj.depthLevel) {
          // create new Parent
          const dependency = depReg.exec(line)
          rubyObj.name = dependency[1]
          rubyObj.depthLevel = currentWS
          populateResolveAndPlatform(dependency[3], rubyObj)
        }

        // need to push into array when:
        // parents with no dep
        // dep and nextline is a parent
        // last line
        if (
          (currentWS === 4 && nexlineWS === 4) ||
          (currentWS === 6 && nexlineWS === 4) ||
          nexlineWS == ''
        ) {
          let newObj = {}
          newObj = JSON.parse(JSON.stringify(rubyObj))
          source.push(newObj)
          rubyObj.dependencies = {}
        }
      }
    }
  }
  ruby.sources = formatSourceArr(source)
}

exports.getSourceArr = getSourceArr
