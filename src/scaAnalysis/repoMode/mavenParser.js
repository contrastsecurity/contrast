const fs = require('fs')
const xml2js = require('xml2js')

const readPomFile = project => {
  const mavenFilePath = project.cwd + '/pom.xml'
  const projectFile = fs.readFileSync(mavenFilePath)
  let jsonPomFile
  xml2js.parseString(projectFile, (err, result) => {
    if (err) {
      throw err
    }
    const json = JSON.stringify(result, null)
    jsonPomFile = JSON.parse(json)
  })
  return jsonPomFile
}

const getFromVersionsTag = (dependencyName, versionIdentifier, jsonPomFile) => {
  // reading:
  // <!-- DEPENDENCY VERSIONS -->
  // <versions.animal-sniffer>1.16</versions.animal-sniffer>
  let formattedVersion = versionIdentifier.replace(/[{}]/g, '').replace('$', '')

  if (jsonPomFile.project.properties[0].hasOwnProperty([formattedVersion])) {
    return jsonPomFile.project.properties[0][formattedVersion][0]
  } else {
    return null
  }
}

const parsePomFile = jsonPomFile => {
  let dependencyTree = {}
  let parsedVersion
  let dependencies
  jsonPomFile.project.hasOwnProperty('dependencies')
    ? (dependencies = jsonPomFile.project.dependencies[0].dependency)
    : (dependencies =
        jsonPomFile.project.dependencyManagement[0].dependencies[0].dependency)

  for (let x in dependencies) {
    let dependencyObject = dependencies[x]
    if (!dependencyObject.hasOwnProperty('version')) {
      parsedVersion = getVersion(jsonPomFile, dependencyObject)
    } else {
      dependencyObject.version[0].includes('${versions.')
        ? (parsedVersion = getFromVersionsTag(
            dependencyObject.artifactId[0],
            dependencyObject.version[0],
            jsonPomFile
          ))
        : (parsedVersion = dependencyObject.version[0])
    }

    let depName =
      dependencyObject.groupId +
      '/' +
      dependencyObject.artifactId +
      '@' +
      parsedVersion

    let parsedDependency = {
      name: dependencyObject.artifactId[0],
      group: dependencyObject.groupId[0],
      version: parsedVersion,
      directDependency: true,
      productionDependency: true,
      dependencies: []
    }
    dependencyTree[depName] = parsedDependency
  }
  return dependencyTree
}

const getVersion = (pomFile, dependencyWithoutVersion) => {
  let parentVersion = pomFile.project.parent[0].version[0]
  let parentGroupName = pomFile.project.parent[0].groupId[0]
  if (parentGroupName === dependencyWithoutVersion.groupId[0]) {
    return parentVersion
  } else {
    return null
  }
}

module.exports = {
  readPomFile,
  getVersion,
  parsePomFile,
  getFromVersionsTag
}
