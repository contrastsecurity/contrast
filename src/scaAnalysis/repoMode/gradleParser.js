const g2js = require('gradle-to-js/lib/parser')

const readBuildGradleFile = async project => {
  const gradleFilePath = project.cwd + '/build.gradle'
  return await g2js.parseFile(gradleFilePath)
}

const filterGav = (groupId, artifactId, version, gradleJson) => {
  if (groupId === '') {
    if (artifactId.includes(':')) {
      groupId = artifactId.split(':')[0].replace("'", '')
    }
  }

  if (version === '') {
    if (artifactId.includes(':')) {
      artifactId.split(':').length > 2
        ? (version = artifactId.split(':')[2].replace("'", ''))
        : (version = null)
    }
  }

  if (artifactId.split(':').length > 1) {
    artifactId = artifactId.split(':')[1].replace("'", '')
  }

  if (version === null) {
    version = getVersion(gradleJson, groupId)
  }
  return { groupId, artifactId, version }
}

const parseGradleJson = gradleJson => {
  let deps = gradleJson.dependencies
  let dependencyTree = {}

  if (deps === undefined) {
    console.log('Unable to find any dependencies in your project file.')
    process.exit(0)
  }

  for (let a in deps) {
    let dependencyType = deps[a].type

    if (dependencyType === 'implementation') {
      let groupId = deps[a].group
      let artifactId = deps[a].name
      let version = deps[a].version

      let filteredGav = filterGav(groupId, artifactId, version, gradleJson)

      let depName =
        filteredGav.groupId +
        '/' +
        filteredGav.artifactId +
        '@' +
        filteredGav.version

      let parsedDependency = {
        name: filteredGav.artifactId,
        group: filteredGav.groupId,
        version: filteredGav.version,
        directDependency: true,
        isProduction: true,
        dependencies: []
      }
      dependencyTree[depName] = parsedDependency
    }
  }
  return dependencyTree
}

const getVersion = (gradleJson, dependencyWithoutVersion) => {
  let parentVersion = gradleJson.plugins[0].version
  let parentGroupName = gradleJson.plugins[0].id
  if (parentGroupName === dependencyWithoutVersion) {
    return parentVersion
  } else {
    return null
  }
}

module.exports = {
  readBuildGradleFile,
  parseGradleJson,
  getVersion,
  filterGav
}
