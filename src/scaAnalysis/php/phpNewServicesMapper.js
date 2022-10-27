const { keyBy, merge } = require('lodash')

const parsePHPLockFileForScaServices = phpLockFile => {
  const packages = keyBy(phpLockFile.packages, 'name')
  const packagesDev = keyBy(phpLockFile['packages-dev'], 'name')

  return merge(buildDepTree(packages, true), buildDepTree(packagesDev, false))
}

const buildDepTree = (packages, productionDependency) => {
  //builds deps into flat structure
  const dependencyTree = {}

  for (const packagesKey in packages) {
    const currentObj = packages[packagesKey]
    const { group, name } = findGroupAndName(currentObj.name)

    const key = `${group}/${name}@${currentObj.version}`
    dependencyTree[key] = {
      group: group,
      name: name,
      version: currentObj.version,
      directDependency: true,
      productionDependency: productionDependency,
      dependencies: []
    }

    const mergedChildDeps = merge(
      buildSubDepsIntoFlatStructure(currentObj.require),
      buildSubDepsIntoFlatStructure(currentObj['require-dev'])
    )

    for (const childKey in mergedChildDeps) {
      const { group, name } = findGroupAndName(childKey)
      const builtKey = `${group}/${name}`
      dependencyTree[builtKey] = mergedChildDeps[childKey]
    }
  }
  return dependencyTree
}

// currently sub deps will be built into a flat structure
// but not ingested via the new services as they do not have concrete versions
const buildSubDepsIntoFlatStructure = childDeps => {
  const dependencyTree = {}

  for (const dep in childDeps) {
    const version = childDeps[dep]
    const { group, name } = findGroupAndName(dep)
    const key = `${group}/${name}`
    dependencyTree[key] = {
      group: group,
      name: name,
      version: version,
      directDependency: false,
      productionDependency: false,
      dependencies: []
    }
  }
  return dependencyTree
}

const findGroupAndName = groupAndName => {
  if (groupAndName.includes('/')) {
    const groupName = groupAndName.split('/')
    return { group: groupName[0], name: groupName[1] }
  } else {
    return { group: groupAndName, name: groupAndName }
  }
}

module.exports = {
  parsePHPLockFileForScaServices,
  buildDepTree,
  buildSubDepsIntoFlatStructure,
  findGroupAndName
}
