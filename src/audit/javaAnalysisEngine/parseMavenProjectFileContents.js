const i18n = require('i18n')

module.exports = exports = ({ language: { projectFilePath }, java }, next) => {
  const { mvnDependancyTreeOutput } = java

  if (projectFilePath.endsWith('pom.xml')) {
    try {
      java.mavenDependencyTrees = parseMvn(mvnDependancyTreeOutput)
      next()
    } catch (err) {
      next(new Error(i18n.__('javaParseProjectFile') + `${err.message}`))
      return
    }
  } else {
    // Go to gradle project
    next()
  }
}

const hasVersion = key => {
  var regex = RegExp('[0-9].[0-9]')
  return regex.test(key)
}

const formatKeyName = value => {
  let tempArr = value.split(':')
  let versionIndex = undefined
  for (let i = 0; i < tempArr.length; i++) {
    if (hasVersion(tempArr[i])) {
      versionIndex = i
    }
  }

  return tempArr[0] + '/' + tempArr[1] + '@' + tempArr[versionIndex]
}

const shaveConsoleOutputUntilItFindsFirsDigraphMention = mvnDependancyTreeOutput => {
  //shaves of the console output until it reaches the first digraph
  return mvnDependancyTreeOutput.substring(
    mvnDependancyTreeOutput.indexOf('digraph')
  )
}

const getDigraphObjInfo = editedOutput => {
  //turns the output into an array of digraph information
  // which looks like
  // ' "com.contrastsecurity:teamserver-model:jar:local" {\n
  // \n [INFO]  "com.contrastsecurity:teamserver-model:jar:local" -> "junit:junit:jar:4.12:test" ;\n
  // \n [INFO]  "junit:junit:jar:4.12:test" -> "org.hamcrest:hamcrest-core:jar:1.3:test" ;\n
  //  [INFO]  }' ]
  let digraphObj = editedOutput.split('digraph')

  return digraphObj.filter(v => v != '')
}

const createDigraphObjKey = element => {
  // parse the digraph to turn into an object key
  let formatObjKey = element.substring(0, element.indexOf('{'))
  formatObjKey = formatObjKey.replace(/"/g, '')
  formatObjKey = formatObjKey.replace('{', '')
  formatObjKey = formatObjKey.trim()

  return formatObjKey
}

const turnDigraphDependanciesIntoArrOfInnerDep = digraphObj => {
  // takes:
  // "com.contrastsecurity:teamserver-model:jar:local" {
  //   [INFO]  "com.contrastsecurity:teamserver-model:jar:local" -> "org.springframework:spring-core:jar:5.1.9.RELEASE:compile" ;
  //   [INFO]  "com.contrastsecurity:teamserver-model:jar:local" -> "junit:junit:jar:4.12:test" ;
  //   [INFO]  "org.springframework:spring-core:jar:5.1.9.RELEASE:compile" -> "org.springframework:spring-jcl:jar:5.1.9.RELEASE:compile" ;
  //   [INFO]  "junit:junit:jar:4.12:test" -> "org.hamcrest:hamcrest-core:jar:1.3:test" ;
  //   [INFO]  }

  // and turns it into
  // [ '"com.contrastsecurity:teamserver-model:jar:local" -> "org.springframework:spring-core:jar:5.1.9.RELEASE:compile"',
  // '"com.contrastsecurity:teamserver-model:jar:local" -> "junit:junit:jar:4.12:test"',
  // '"org.springframework:spring-core:jar:5.1.9.RELEASE:compile" -> "org.springframework:spring-jcl:jar:5.1.9.RELEASE:compile"',
  // '"junit:junit:jar:4.12:test" -> "org.hamcrest:hamcrest-core:jar:1.3:test"',
  // '' ]

  let depRow = digraphObj.substring(
    digraphObj.indexOf('{'),
    digraphObj.indexOf('}') + 1
  )
  depRow = depRow.replace(/\[INFO\]/g, '')
  depRow = depRow.replace(/\n/g, '')
  depRow = depRow.replace(/\{/g, '')
  depRow = depRow.replace(/\}/g, '')
  depRow = depRow.replace(/\"/g, '') // eslint-disable-line

  return depRow.split(';').map(s => s.trim())
}

const createOuterDependanciesAndType = (digraphObjKey, arrOfInnerDep) => {
  let leftKey
  let rightKey
  let newDepNode
  const list = []

  arrOfInnerDep.forEach(element => {
    leftKey = element.substring(0, element.indexOf(' -'))
    rightKey = element.substring(element.indexOf('>') + 2)

    // if the digraph and the leftKey are the same and the left has a version
    // then “edgeType” is direct
    if (leftKey === digraphObjKey) {
      if (hasVersion(rightKey)) {
        let rightKeyArr = rightKey.split(':')
        newDepNode = {
          [rightKey]: {
            group: rightKeyArr[0],
            artifactID: rightKeyArr[1],
            packaging: rightKeyArr[2],
            version: rightKeyArr[3],
            scope: rightKeyArr[4],
            type: 'direct',
            parent: leftKey,
            edges: {}
          }
        }
        list.push(newDepNode)
      }
    }
    // if right and left both have versions and left doesn't match digraph name
    // then “type” is transitive
    if (
      hasVersion(leftKey) &&
      hasVersion(rightKey) &&
      !(leftKey === digraphObjKey)
    ) {
      let rightKeyArr = rightKey.split(':')
      newDepNode = {
        [rightKey]: {
          group: rightKeyArr[0],
          artifactID: rightKeyArr[1],
          packaging: rightKeyArr[2],
          version: rightKeyArr[3],
          scope: rightKeyArr[4],
          type: 'transitive',
          parent: leftKey,
          edges: {}
        }
      }
      list.push(newDepNode)
    }
  })

  return list
}

const createEdges = (digraphObjKey, listOuterDep) => {
  listOuterDep.forEach(element => {
    const key = Object.keys(element).toString()

    const childParentRef = element[key].parent

    if (childParentRef !== digraphObjKey) {
      listOuterDep.forEach(i => {
        let parentKey = Object.keys(i).toString()
        if (childParentRef === parentKey) {
          i[parentKey].edges[formatKeyName(key)] = formatKeyName(key)
        }
      })
    }
  })
  return listOuterDep
}

const extractFromArrAndFinalParse = listWithEdges => {
  let finalObj = {}
  listWithEdges.forEach(element => {
    const key = Object.keys(element).toString()

    const parsedKey = formatKeyName(key)

    delete element[key].parent

    finalObj[parsedKey] = element[key]
  })
  return finalObj
}

const dependancyValueCreationOrganiser = (digraphObjKey, digraph) => {
  const arrOfInnerDep = turnDigraphDependanciesIntoArrOfInnerDep(digraph)
  const listOuterDep = createOuterDependanciesAndType(
    digraphObjKey,
    arrOfInnerDep
  )
  const listWithEdges = createEdges(digraphObjKey, listOuterDep)
  const finishDepObj = extractFromArrAndFinalParse(listWithEdges)

  return finishDepObj
}

const parseMvn = mvnDependancyTreeOutput => {
  let parsedDepObj = {}
  let editedOutput = shaveConsoleOutputUntilItFindsFirsDigraphMention(
    mvnDependancyTreeOutput
  )
  let digraphObjArray = getDigraphObjInfo(editedOutput)

  digraphObjArray.forEach(digraph => {
    const digraphObjKey = createDigraphObjKey(digraph)
    parsedDepObj[digraphObjKey] = dependancyValueCreationOrganiser(
      digraphObjKey,
      digraph
    )
  })
  return parsedDepObj
}

// testing purposes
exports.shaveConsoleOutputUntilItFindsFirsDigraphMention = shaveConsoleOutputUntilItFindsFirsDigraphMention
exports.getDigraphObjInfo = getDigraphObjInfo
exports.createDigraphObjKey = createDigraphObjKey
exports.turnDigraphDependanciesIntoArrOfInnerDep = turnDigraphDependanciesIntoArrOfInnerDep
exports.hasVersion = hasVersion
exports.formatKeyName = formatKeyName
exports.createOuterDependanciesAndType = createOuterDependanciesAndType
exports.extractFromArrAndFinalParse = extractFromArrAndFinalParse
exports.createEdges = createEdges
