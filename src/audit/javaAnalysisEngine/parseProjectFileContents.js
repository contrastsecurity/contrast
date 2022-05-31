const i18n = require('i18n')
let projectType = ''
const StringBuilder = require('string-builder')
let sb = new StringBuilder()

module.exports = exports = (
  { language: { projectFilePath }, java },
  next,
  config
) => {
  const { mvnDependancyTreeOutput } = java
  if (
    projectFilePath.endsWith('build.gradle') ||
    projectFilePath.endsWith('pom.xml')
  ) {
    if (projectFilePath.endsWith('build.gradle')) {
      projectType = 'Gradle'
    } else {
      projectType = 'Maven'
    }
    try {
      java.mavenDependencyTrees = parseGradle(mvnDependancyTreeOutput, config)
      next()
    } catch (err) {
      next(new Error(i18n.__('javaParseProjectFile') + `${err.message}`))
      return
    }
  } else {
    next()
  }
}

const preParser = shavedOutput => {
  let obj = []
  for (let dep in shavedOutput) {
    obj.push(
      shavedOutput[dep]
        .replace('+-', '+---')
        .replace('[INFO]', '')
        .replace('\\-', '\\---')
        .replace(':jar:', ':')
        .replace(':test', '')
        .replace(':compile', '')
        .replace(' +', '+')
        .replace(' |', '|')
        .replace(' \\', '\\')
        .replace(':runtime', '')
    )
  }

  let depTree = []
  for (let x in obj) {
    let nodeLevel = computeRelationToLastElement(obj[x])

    let notLastLevel =
      obj[x].startsWith('|') ||
      obj[x].startsWith('+') ||
      obj[x].startsWith('\\')

    if (notLastLevel) {
      if (nodeLevel === 0) {
        depTree.push(obj[x])
      } else {
        let level = computeLevel(nodeLevel)
        let validatedLevel = addIndentation(nodeLevel === 2 ? 5 : level, obj[x])
        depTree.push(validatedLevel)
      }
    } else {
      let level = computeLevel(nodeLevel)
      let validatedLevel = addIndentation(nodeLevel === 3 ? 5 : level, obj[x])
      depTree.push(validatedLevel)
    }
  }

  return depTree
}

const shaveOutput = gradleDependencyTreeOutput => {
  let shavedOutput = gradleDependencyTreeOutput.split('\n')

  if (projectType === 'Maven') {
    shavedOutput = preParser(shavedOutput)
  }

  let obj = []
  for (let key in shavedOutput) {
    if (shavedOutput[key].includes('project :')) {
      //skip
    } else if (
      shavedOutput[key].includes('+---') ||
      shavedOutput[key].includes('\\---')
    ) {
      obj.push(shavedOutput[key])
    }
  }
  return obj
}

const computeIndentation = element => {
  let hasPlus = element.includes('+')
  let hasSlash = element.includes('\\')
  if (hasPlus) {
    return element.substring(element.indexOf('+'))
  }
  if (hasSlash) {
    return element.substring(element.indexOf('\\'))
  }
}

const computeLevel = nodeLevel => {
  let num = [5, 8, 11, 14, 17, 20]
  for (let z in num) {
    if (num[z] === nodeLevel) {
      let n = parseInt(z)
      return 5 * (n + 2)
    }
  }
}

const addIndentation = (number, str) => {
  str = computeIndentation(str)
  sb.clear() // need to clear so each dep doesn't append to the string
  for (let j = 0; j < number; j++) {
    sb.append(' ')
  }
  sb.append(str)
  return sb.toString()
}

const computeRelationToLastElement = element => {
  let hasPlus = element.includes('+---')
  let hasSlash = element.includes('\\---')
  if (hasPlus) {
    return element.split('+---')[0].length
  }
  if (hasSlash) {
    return element.split('\\---')[0].length
  }
}

const stripElement = element => {
  return element
    .replace(/[|]/g, '')
    .replace('+---', '')
    .replace('\\---', '')
    .replace(/[' ']/g, '')
    .replace('(c)', '')
    .replace('->', '@')
    .replace('(*)', '')
}

const checkVersion = element => {
  let version = element.split(':')
  return version[version.length - 1]
}

const createElement = (element, isRoot) => {
  let tree
  let cleanElement = stripElement(element)
  let splitGroupName = cleanElement.split(':')

  let validateVersion = false
  if (!element.includes('->')) {
    validateVersion = true
  }

  tree = {
    artifactID: splitGroupName[1],
    group: splitGroupName[0],
    version: validateVersion
      ? checkVersion(cleanElement)
      : splitGroupName[splitGroupName.length - 1],
    scope: 'compile',
    type: isRoot ? 'direct' : 'transitive',
    edges: {}
  }
  return tree
}

const getElementHeader = element => {
  let elementHeader = stripElement(element)
  elementHeader = elementHeader.replace(':', '/')
  elementHeader = elementHeader.replace(':', '@')

  return elementHeader
}

const buildElement = (element, rootElement, parentOfCurrent, tree, isRoot) => {
  let childElement = createElement(element, isRoot)
  let elementHeader = getElementHeader(element)
  let levelsArray = [rootElement, parentOfCurrent]
  const treeNode = getNestedObject(tree, levelsArray)
  const rootNode = getNestedObject(tree, [rootElement])

  // eslint-disable-next-line
  if (!rootNode.hasOwnProperty(elementHeader)) {
    tree[rootElement][elementHeader] = childElement
  }
  treeNode.edges[elementHeader] = elementHeader
}

const hasChildren = (nextNodeLevel, nodeLevel) => {
  if (nextNodeLevel > nodeLevel) {
    return true
  }
}

const lastChild = (nextNodeLevel, nodeLevel) => {
  if (nextNodeLevel < nodeLevel) {
    return true
  }
}

const calculateLevels = (nextNodeLevel, nodeLevel) => {
  return (nodeLevel - nextNodeLevel) / 5
}

const buildTree = shavedOutput => {
  let tree = {}
  let rootElement
  let levelNodes = []

  shavedOutput.forEach((element, index) => {
    if (index === 0) {
      // console.log(element, index)
      let cleanElement = stripElement(element)
      let elementHeader = getElementHeader(cleanElement)
      let splitElement = element.split(' ')
      let splitGroupName = splitElement[1].split(':')

      let validateVersion = false
      if (!element.includes('->')) {
        validateVersion = true
      }

      tree[splitGroupName[0]] = {}
      tree[splitGroupName[0]][elementHeader] = {
        artifactID: splitGroupName[1],
        group: splitGroupName[0],
        version: validateVersion
          ? checkVersion(cleanElement)
          : splitElement[splitElement.length - 1],
        scope: 'compile',
        type: 'direct',
        edges: {}
      }

      rootElement = splitGroupName[0]
      levelNodes.push(elementHeader)
    }

    if (shavedOutput.length - 1 === index) {
      // console.log(element, index)
      const parentOfCurrent = levelNodes[levelNodes.length - 1]
      let nodeLevel = computeRelationToLastElement(element)

      let validateVersion = false
      if (!element.includes('->')) {
        validateVersion = true
      }

      if (nodeLevel === 0) {
        let cleanElement = stripElement(element)
        let elementHeader = getElementHeader(cleanElement)
        let splitElement = element.split(' ')
        let splitGroupName = splitElement[1].split(':')
        tree[rootElement][elementHeader] = {
          artifactID: splitGroupName[1],
          group: splitGroupName[0],
          version: validateVersion
            ? checkVersion(cleanElement)
            : splitElement[splitElement.length - 1],
          scope: 'compile',
          type: 'direct',
          edges: {}
        }
      } else {
        buildElement(element, rootElement, parentOfCurrent, tree)
      }
    }

    if (index >= 1 && index < shavedOutput.length - 1) {
      let nodeLevel = computeRelationToLastElement(element)
      let nextNodeLevel = computeRelationToLastElement(shavedOutput[index + 1])
      const parentOfCurrent = levelNodes[levelNodes.length - 1]

      let isRoot = false
      if (nodeLevel === 0) {
        isRoot = true
      }

      // useful for debugging
      // console.log(
      //   element,
      //   index,
      //   'nodeLevel:',
      //   nodeLevel,
      //   'nextNodeLevel:',
      //   nextNodeLevel,
      //   'parentofCurrent:',
      //   parentOfCurrent
      // )

      if (isRoot) {
        let cleanElement = stripElement(element)
        let elementHeader = getElementHeader(cleanElement)
        let splitElement = element.split(' ')
        let splitGroupName = splitElement[1].split(':')

        let validateVersion = false
        if (!element.includes('->')) {
          validateVersion = true
        }

        tree[rootElement][elementHeader] = {
          artifactID: splitGroupName[1],
          group: splitGroupName[0],
          version: validateVersion
            ? checkVersion(cleanElement)
            : splitElement[splitElement.length - 1],
          scope: 'compile',
          type: 'direct',
          edges: {}
        }
        levelNodes.push(elementHeader)
        return
      }

      let elementHeader = getElementHeader(element)
      buildElement(element, rootElement, parentOfCurrent, tree, isRoot)

      if (hasChildren(nextNodeLevel, nodeLevel)) {
        buildElement(element, rootElement, parentOfCurrent, tree, isRoot)
        levelNodes.push(elementHeader)
      }

      if (lastChild(nextNodeLevel, nodeLevel)) {
        let levelDifference = calculateLevels(nextNodeLevel, nodeLevel)
        if (levelDifference === 0) {
          levelNodes.pop()
        } else {
          let i
          for (i = 0; i < levelDifference; i++) {
            levelNodes.pop()
          }
        }
      }
    }
  })

  return tree
}

const getNestedObject = (nestedObj, pathArr) => {
  return pathArr.reduce(
    (obj, key) => (obj && obj[key] !== 'undefined' ? obj[key] : undefined),
    nestedObj
  )
}

// emit any "+--- project :" within the tree
const parseSubProject = shavedOutput => {
  let obj = []
  for (let key in shavedOutput) {
    if (!shavedOutput[key].includes('project')) {
      obj.push(shavedOutput[key])
    }
  }
  return obj
}

const validateIndentation = shavedOutput => {
  let validatedTree = []
  shavedOutput.forEach((element, index) => {
    let nextNodeLevel
    let nodeLevel = computeRelationToLastElement(element)
    if (shavedOutput[index + 1] !== undefined) {
      nextNodeLevel = computeRelationToLastElement(shavedOutput[index + 1])
    }
    if (index === 0) {
      validatedTree.push(shavedOutput[index])
      validatedTree.push(shavedOutput[index + 1])
    } else if (nextNodeLevel > nodeLevel + 5) {
      return
    } else {
      validatedTree.push(shavedOutput[index + 1])
    }
  })
  validatedTree.pop()
  return validatedTree
}

const parseGradle = (gradleDependencyTreeOutput, config) => {
  let shavedOutput = shaveOutput(gradleDependencyTreeOutput)

  if (config.subProject) {
    let subProject = parseSubProject(shavedOutput)
    let validatedOutput = validateIndentation(subProject)
    return buildTree(validatedOutput)
  } else {
    let validatedOutput = validateIndentation(shavedOutput)
    return buildTree(validatedOutput)
  }
}

exports.shaveOutput = shaveOutput
exports.validateIndentation = validateIndentation
exports.stripElement = stripElement
exports.getElementHeader = getElementHeader
exports.createElement = createElement
exports.parseGradle = parseGradle
exports.computeRelationToLastElement = computeRelationToLastElement
exports.hasChildren = hasChildren
exports.lastChild = lastChild
exports.calculateLevels = calculateLevels
exports.buildElement = buildElement
exports.checkVersion = checkVersion
exports.computeIndentation = computeIndentation
exports.computeLevel = computeLevel
exports.addIndentation = addIndentation
