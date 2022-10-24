const parseJS = rawNode => {
  let dependencyTree = {}
  let combinedPackageJSONDep = {
    ...rawNode.packageJSON?.dependencies,
    ...rawNode.packageJSON?.devDependencies
  }
  let analyseLock = chooseLockFile(rawNode)

  if (analyseLock.type === 'yarn') {
    dependencyTree = yarnCreateDepTree(
      dependencyTree,
      combinedPackageJSONDep,
      analyseLock.lockFile,
      rawNode
    )
  }

  if (analyseLock.type === 'npm') {
    dependencyTree = npmCreateDepTree(
      dependencyTree,
      combinedPackageJSONDep,
      analyseLock.lockFile,
      rawNode
    )
  }

  return dependencyTree
}

const npmCreateDepTree = (
  dependencyTree,
  combinedPackageJSONDep,
  packageLock,
  rawNode
) => {
  for (const [key, value] of Object.entries(packageLock)) {
    dependencyTree[key] = {
      name: key,
      version: getResolvedVersion(key, packageLock),
      group: null,
      productionDependency: checkIfInPackageJSON(
        rawNode.packageJSON.dependencies,
        key
      ),
      directDependency: checkIfInPackageJSON(combinedPackageJSONDep, key),
      dependencies: createNPMChildDependencies(packageLock, key)
    }
  }
  return dependencyTree
}

const yarnCreateDepTree = (
  dependencyTree,
  combinedPackageJSONDep,
  packageLock,
  rawNode
) => {
  for (const [key, value] of Object.entries(packageLock)) {
    let gav = getNameFromGAV(key)
    let nag = getDepNameWithoutVersion(key)
    dependencyTree[key] = {
      name: gav,
      version: getResolvedVersion(key, packageLock),
      group: null,
      productionDependency: checkIfInPackageJSON(
        rawNode.packageJSON.dependencies,
        nag
      ),
      directDependency: checkIfInPackageJSON(combinedPackageJSONDep, nag),
      dependencies: createChildDependencies(packageLock, key)
    }
  }
  return dependencyTree
}

const chooseLockFile = rawNode => {
  if (rawNode?.yarn?.yarnLockFile !== undefined) {
    return { lockFile: rawNode?.yarn?.yarnLockFile?.object, type: 'yarn' }
  } else if (rawNode.npmLockFile !== undefined) {
    return { lockFile: rawNode?.npmLockFile?.dependencies, type: 'npm' }
  } else {
    return undefined
  }
}

const createKeyName = (dep, version) => {
  return dep + '@' + version
}

const checkIfInPackageJSON = (list, dep) => {
  return Object.keys(list).includes(dep)
}

const createChildDependencies = (lockFileDep, currentDep) => {
  let depArray = []
  if (lockFileDep[currentDep]?.dependencies) {
    for (const [key, value] of Object.entries(
      lockFileDep[currentDep]?.dependencies
    )) {
      depArray.push(createKeyName(key, value))
    }
  }
  return depArray
}

const createNPMChildDependencies = (lockFileDep, currentDep) => {
  let depArray = []
  if (lockFileDep[currentDep]?.requires) {
    for (const [key, value] of Object.entries(
      lockFileDep[currentDep]?.requires
    )) {
      depArray.push(key)
    }
  }
  return depArray
}

const getDepNameWithoutVersion = depKey => {
  let dependency = depKey.split('@')
  if (dependency.length - 1 > 1) {
    return '@' + dependency[1]
  }
  return dependency[0]
}

const getNameFromGAV = depKey => {
  let dependency = depKey.split('/')
  if (dependency.length == 2) {
    dependency = getDepNameWithoutVersion(dependency[1])
    return dependency
  }
  if (dependency.length == 1) {
    dependency = getDepNameWithoutVersion(depKey)
    return dependency
  }
  //what should we do if there's no version? The service will fall over but do we want to throw error for only one wrong version?
  return depKey
}

const getResolvedVersion = (depKey, packageLock) => {
  return packageLock[depKey]?.version
}

module.exports = {
  parseJS,
  checkIfInPackageJSON,
  getNameFromGAV,
  getResolvedVersion,
  chooseLockFile,
  createNPMChildDependencies
}
