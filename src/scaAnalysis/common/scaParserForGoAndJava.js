const parseDependenciesForSCAServices = dependencyTreeObject => {
  let parsedDependencyTree = {}
  let subDeps

  for (let tree in dependencyTreeObject) {
    let unParsedDependencyTree = dependencyTreeObject[tree]
    for (let dependency in unParsedDependencyTree) {
      subDeps = parseSubDependencies(unParsedDependencyTree[dependency].edges)

      let parsedDependency = {
        name: unParsedDependencyTree[dependency].artifactID,
        group: unParsedDependencyTree[dependency].group,
        version: unParsedDependencyTree[dependency].version,
        directDependency: unParsedDependencyTree[dependency].type === 'direct',
        productionDependency: true,
        dependencies: subDeps
      }
      parsedDependencyTree[dependency] = parsedDependency
    }
  }
  return parsedDependencyTree
}

const parseSubDependencies = dependencies => {
  // converting:
  // dependencies: {
  //   'gopkg.in/check.v1@v0.0.0-2': 'gopkg.in/check.v1@v0.0.0-2'
  // }
  // to:
  // dependencies: [ 'gopkg.in/check.v1@v0.0.0-2' ]
  let subDeps = []
  for (let x in dependencies) {
    subDeps.push(dependencies[x])
  }
  return subDeps
}

module.exports = {
  parseDependenciesForSCAServices,
  parseSubDependencies
}
