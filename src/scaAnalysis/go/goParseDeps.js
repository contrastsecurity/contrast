const crypto = require('crypto')

const parseGoDependencies = goDeps => {
  return parseGo(goDeps)
}

const parseGo = modGraphOutput => {
  let splitLines = splitAllLinesIntoArray(modGraphOutput)
  const directDepNames = getDirectDepNames(splitLines)
  const uniqueTransitiveDepNames = getAllUniqueTransitiveDepNames(
    splitLines,
    directDepNames
  )

  let rootNodes = createRootNodes(splitLines)

  createTransitiveDeps(uniqueTransitiveDepNames, splitLines, rootNodes)

  return rootNodes
}

const splitAllLinesIntoArray = modGraphOutput => {
  return modGraphOutput.split(/\r\n|\r|\n/)
}

const getAllDepsOfADepAsEdge = (dep, deps) => {
  let edges = {}

  const depRows = deps.filter(line => {
    return line.startsWith(dep)
  })

  depRows.forEach(dep => {
    const edgeName = dep.split(' ')[1]
    edges[edgeName] = edgeName
  })

  return edges
}

const getAllDepsOfADepAsName = (dep, deps) => {
  let edges = []

  const depRows = deps.filter(line => {
    return line.startsWith(dep)
  })

  depRows.forEach(dep => {
    const edgeName = dep.split(' ')[1]
    edges.push(edgeName)
  })

  return edges
}

const createRootNodes = deps => {
  let rootDep = {}
  const rootDeps = getRootDeps(deps)

  const edges = rootDeps.map(dep => {
    return dep.split(' ')[1]
  })

  rootDep[rootDeps[0].split(' ')[0]] = {}

  edges.forEach(edge => {
    const splitEdge = edge.split('@')
    const splitGroupName = splitEdge[0].split('/')
    const name = splitGroupName.pop()
    const lastSlash = splitEdge[0].lastIndexOf('/')
    let group = splitEdge[0].substring(0, lastSlash)
    const hash = getHash(splitEdge[0])

    group = checkGroupExists(group, name)

    //get the edges of the root dependency
    const edgesOfDep = getAllDepsOfADepAsEdge(edge, deps)

    rootDep[rootDeps[0].split(' ')[0]][edge] = {
      artifactID: name,
      group: group,
      version: splitEdge[1],
      scope: '"compile',
      type: 'direct',
      hash: hash,
      edges: edgesOfDep
    }
  })
  return rootDep
}

const getRootDeps = deps => {
  const rootDeps = deps.filter(dep => {
    const parentDep = dep.split(' ')[0]
    if (parentDep.split('@v').length === 1) {
      return dep
    }
  })
  return rootDeps
}

const getHash = library => {
  let shaSum = crypto.createHash('sha1')
  shaSum.update(library)
  return shaSum.digest('hex')
}

const getDirectDepNames = deps => {
  const directDepNames = []

  deps.forEach(dep => {
    const parentDep = dep.split(' ')[0]
    if (parentDep.split('@v').length === 1) {
      dep.split(' ')[1] !== undefined
        ? directDepNames.push(dep.split(' ')[1])
        : null
    }
  })
  return directDepNames
}

const getAllUniqueTransitiveDepNames = (deps, directDepNames) => {
  let uniqueDeps = []

  deps.forEach(dep => {
    const parentDep = dep.split(' ')[0]
    if (parentDep.split('@v').length !== 1) {
      if (!directDepNames.includes(parentDep)) {
        if (!uniqueDeps.includes(parentDep)) {
          parentDep.length > 1 ? uniqueDeps.push(parentDep) : null
        }
      }
    }
  })
  return uniqueDeps
}

const checkGroupExists = (group, name) => {
  if (group === null || group === '') {
    return name
  }
  return group
}

const createTransitiveDeps = (transitiveDeps, splitLines, rootNodes) => {
  transitiveDeps.forEach(dep => {
    //create transitive dep
    const splitEdge = dep.split('@')
    const splitGroupName = splitEdge[0].split('/')
    const name = splitGroupName.pop()
    const lastSlash = splitEdge[0].lastIndexOf('/')
    let group = splitEdge[0].substring(0, lastSlash)
    const hash = getHash(splitEdge[0])

    group = checkGroupExists(group, name)

    const transitiveDep = {
      artifactID: name,
      group: group,
      version: splitEdge[1],
      scope: 'compile',
      type: 'transitive',
      hash: hash,
      edges: {}
    }

    //add edges to transitiveDep
    const edges = getAllDepsOfADepAsEdge(dep, splitLines)
    transitiveDep.edges = edges

    //add all edges as a transitive dependency to rootNodes
    const edgesAsName = getAllDepsOfADepAsName(dep, splitLines)

    edgesAsName.forEach(dep => {
      const splitEdge = dep.split('@')
      const splitGroupName = splitEdge[0].split('/')
      const name = splitGroupName.pop()
      const lastSlash = splitEdge[0].lastIndexOf('/')
      let group = splitEdge[0].substring(0, lastSlash)
      const hash = getHash(splitEdge[0])

      group = checkGroupExists(group, name)

      const transitiveDep = {
        artifactID: name,
        group: group,
        version: splitEdge[1],
        scope: 'compile',
        type: 'transitive',
        hash: hash,
        edges: {}
      }
      rootNodes[Object.keys(rootNodes)[0]][dep] = transitiveDep
    })

    //add transitive dependency to rootNodes
    rootNodes[Object.keys(rootNodes)[0]][dep] = transitiveDep
  })
}

module.exports = {
  parseGoDependencies
}
