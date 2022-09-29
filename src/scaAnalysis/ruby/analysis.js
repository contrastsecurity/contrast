const fs = require('fs')
const i18n = require('i18n')

const getRubyDeps = (config, languageFiles) => {
  try {
    checkForCorrectFiles(languageFiles)
    const parsedGem = readAndParseGemfile(config.file)
    const parsedLock = readAndParseGemLockFile(config.file)
    if (config.experimental) {
      const rubyArray = removeRedundantAndPopulateDefinedElements(
        parsedLock.sources
      )
      let rubyTree = createRubyTree(rubyArray)
      findChildrenDependencies(rubyTree)
      processRootDependencies(parsedLock.dependencies, rubyTree)
      return rubyTree
    } else {
      return { gemfilesDependanceies: parsedGem, gemfileLock: parsedLock }
    }
  } catch (err) {
    throw err
  }
}

const readAndParseGemfile = file => {
  const gemFile = fs.readFileSync(file + '/Gemfile', 'utf8')
  const rubyArray = gemFile.split('\n')

  let filteredRubyDep = rubyArray.filter(element => {
    return (
      !element.includes('#') &&
      element.includes('gem') &&
      !element.includes('source')
    )
  })

  for (let i = 0; i < filteredRubyDep.length; i++) {
    filteredRubyDep[i] = filteredRubyDep[i].trim()
  }

  return filteredRubyDep
}

const readAndParseGemLockFile = file => {
  const lockFile = fs.readFileSync(file + '/Gemfile.lock', 'utf8')
  const dependencyRegEx = /^\s*([A-Za-z0-9.!@#$%\-^&*_+]*)\s*(\((.*?)\))/

  const lines = lockFile.split('\n')

  return {
    dependencies: getDirectDependencies(lines, dependencyRegEx),
    runtimeDetails: getLockFileRuntimeInfo(lines),
    sources: getSourceArray(lines, dependencyRegEx)
  }
}

const nonDependencyKeys = (line, sourceObject) => {
  const GEMFILE_KEY_VALUE = /^\s*([^:(]*)\s*\:*\s*(.*)/
  let parts = GEMFILE_KEY_VALUE.exec(line)
  let key = parts[1].trim()
  let value = parts[2] || ''

  sourceObject[key] = value
  return sourceObject
}

const populateResolveAndPlatform = (version, sourceObject) => {
  const depArr = version.split('-')
  sourceObject.resolved = depArr[0]
  sourceObject.platform = depArr.length > 1 ? depArr[1] : 'UNSPECIFIED'
  return sourceObject
}

const isUpperCase = str => {
  return str === str.toUpperCase()
}

const getDirectDependencies = (lines, dependencyRegEx) => {
  const dependencies = {}

  let depIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'DEPENDENCIES') {
      depIndex = i
    }
  }
  const getDepArray = lines.slice(depIndex)

  for (let j = 1; j < getDepArray.length; j++) {
    const element = getDepArray[j]
    if (!isUpperCase(element)) {
      const isDependencyWithVersion = dependencyRegEx.test(element)
      if (isDependencyWithVersion) {
        const dependency = dependencyRegEx.exec(element)
        let name = dependency[1]
        name = name.replace('!', '')
        dependencies[name.trim()] = dependency[3]
      } else {
        let name = element
        name = name.replace('!', ' ')
        dependencies[name.trim()] = 'UNSPECIFIED'
      }
    }
  }

  return dependencies
}

const getLockFileRuntimeInfo = lines => {
  let rubVersionIndex = 0
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'RUBY VERSION') {
      rubVersionIndex = i
      break
    }
  }

  const runtimeDetails = {}
  if (rubVersionIndex !== 0) {
    const getRubyVersionArray = lines.slice(rubVersionIndex)

    for (let element of getRubyVersionArray) {
      if (!isUpperCase(element)) {
        runtimeDetails['version'] = getVersion(element)
        runtimeDetails['patchLevel'] = getPatchLevel(element)

        if (element.includes('engine')) {
          let splitElement = element.split(' ')
          runtimeDetails[splitElement[0]] = splitElement[1]
        }
      }
    }
  }
  return runtimeDetails
}

const getVersion = element => {
  const versionRegex = /^([ruby\s0-9.*]+)/
  if (versionRegex.test(element)) {
    let version = versionRegex.exec(element)[0]

    if (version.includes('ruby')) {
      return trimWhiteSpace(version.replace('ruby', ''))
    }
  }
}

const getPatchLevel = element => {
  const patchLevelRegex = /(p\d+)/
  if (patchLevelRegex.test(element)) {
    return patchLevelRegex.exec(element)[0]
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

const getSourceArray = (lines, dependencyRegEx) => {
  const sourceObject = {
    dependencies: {}
  }

  const whitespaceRegx = /^(\s*)/
  let index = 0

  let line = 0
  const sources = []
  while ((line = lines[index++]) !== undefined) {
    let currentWS = whitespaceRegx.exec(line)[1].length
    if (!line.includes(' bundler (')) {
      if (currentWS === 0 && !line.includes(':') && line !== '') {
        sourceObject.sourceType = line
      }

      if (currentWS !== 0 && line.includes(':')) {
        nonDependencyKeys(line, sourceObject)
      }

      if (currentWS > 2) {
        let nexlineWS = whitespaceRegx.exec(lines[index])[1].length
        sourceObject.dependencies = buildSourceDependencyWithVersion(
          whitespaceRegx,
          dependencyRegEx,
          line,
          currentWS,
          sourceObject.name,
          sourceObject.dependencies
        )

        if (currentWS === 4 && sourceObject.depthLevel === undefined) {
          const dependency = dependencyRegEx.exec(line)
          sourceObject.name = dependency[1]
          sourceObject.depthLevel = currentWS
          populateResolveAndPlatform(dependency[3], sourceObject)
        }

        if (currentWS === 4 && sourceObject.depthLevel) {
          // create new Parent
          const dependency = dependencyRegEx.exec(line)
          sourceObject.name = dependency[1]
          sourceObject.depthLevel = currentWS
          populateResolveAndPlatform(dependency[3], sourceObject)
        }

        if (
          (currentWS === 4 && nexlineWS === 4) ||
          (currentWS === 6 && nexlineWS === 4) ||
          nexlineWS == ''
        ) {
          let newObj = {}
          newObj = JSON.parse(JSON.stringify(sourceObject))
          sources.push(newObj)
          sourceObject.dependencies = {}
        }
      }
    }
  }
  return formatSourceArr(sources)
}

const buildSourceDependencyWithVersion = (
  whitespaceRegx,
  dependencyRegEx,
  line,
  currentWhiteSpace,
  name,
  dependencies
) => {
  const isDependencyWithVersion = dependencyRegEx.test(line)

  if (currentWhiteSpace === 6) {
    const dependency = dependencyRegEx.exec(line)
    if (isDependencyWithVersion) {
      if (name !== dependency[1]) {
        dependencies[dependency[1]] = dependency[3]
      }
    } else {
      dependencies[line.trim()] = 'UNSPECIFIED'
    }
  }

  return dependencies
}

const processRootDependencies = (rootDependencies, rubyTree) => {
  const getParentObjectByName = queryToken =>
    Object.values(rubyTree).filter(({ name }) => name === queryToken)

  for (let parent in rootDependencies) {
    let parentObject = getParentObjectByName(parent)

    // ignore root dependencies that don't have a resolved version
    if (parentObject[0]) {
      let gav =
        parentObject[0].group +
        '/' +
        parentObject[0].name +
        '@' +
        parentObject[0].version

      rubyTree[gav] = parentObject[0]
      rubyTree[gav].directDependency = true
    }
  }
  return rubyTree
}

const createRubyTree = rubyArray => {
  let rubyTree = {}
  for (let x in rubyArray) {
    let version = rubyArray[x].resolved

    let gav = rubyArray[x].group + '/' + rubyArray[x].name + '@' + version
    rubyTree[gav] = rubyArray[x]
    rubyTree[gav].directDependency = false
    rubyTree[gav].version = version

    // add dependency array if none exists
    if (!rubyTree[gav].dependencies) {
      rubyTree[gav].dependencies = []
    }

    delete rubyTree[gav].resolved
  }
  return rubyTree
}

const findChildrenDependencies = rubyTree => {
  for (let dep in rubyTree) {
    let unResolvedChildDepsKey = Object.keys(rubyTree[dep].dependencies)
    rubyTree[dep].dependencies = resolveVersionOfChildDependencies(
      unResolvedChildDepsKey,
      rubyTree
    )
  }
}

const resolveVersionOfChildDependencies = (
  unResolvedChildDepsKey,
  rubyObject
) => {
  const getParentObjectByName = queryToken =>
    Object.values(rubyObject).filter(({ name }) => name === queryToken)
  let resolvedChildrenDependencies = []
  for (let childDep in unResolvedChildDepsKey) {
    let childDependencyName = unResolvedChildDepsKey[childDep]
    let parent = getParentObjectByName(childDependencyName)
    resolvedChildrenDependencies.push(
      'null/' + childDependencyName + '@' + parent[0].version
    )
  }
  return resolvedChildrenDependencies
}

const removeRedundantAndPopulateDefinedElements = deps => {
  return deps.map(element => {
    if (element.sourceType === 'GIT') {
      delete element.sourceType
      delete element.remote
      delete element.platform

      element.group = null
      element.isProduction = true
    }

    if (element.sourceType === 'GEM') {
      element.group = null
      element.isProduction = true

      delete element.sourceType
      delete element.remote
      delete element.platform
    }

    if (element.sourceType === 'PATH') {
      element.group = null
      element.isProduction = true

      delete element.platform
      delete element.sourceType
      delete element.remote
    }

    if (element.sourceType === 'BUNDLED WITH') {
      element.group = null
      element.isProduction = true

      delete element.sourceType
      delete element.remote
      delete element.branch
      delete element.revision
      delete element.depthLevel
      delete element.specs
      delete element.platform
    }
    return element
  })
}

const checkForCorrectFiles = languageFiles => {
  if (!languageFiles.includes('Gemfile.lock')) {
    throw new Error(i18n.__('languageAnalysisHasNoLockFile', 'ruby'))
  }

  if (!languageFiles.includes('Gemfile')) {
    throw new Error(i18n.__('languageAnalysisProjectFileError', 'ruby'))
  }
}

const trimWhiteSpace = string => {
  return string.replace(/\s+/g, '')
}

module.exports = {
  getRubyDeps,
  readAndParseGemfile,
  readAndParseGemLockFile,
  nonDependencyKeys,
  populateResolveAndPlatform,
  isUpperCase,
  getDirectDependencies,
  getLockFileRuntimeInfo,
  getVersion,
  getPatchLevel,
  formatSourceArr,
  getSourceArray,
  checkForCorrectFiles,
  removeRedundantAndPopulateDefinedElements,
  createRubyTree,
  findChildrenDependencies,
  processRootDependencies
}
