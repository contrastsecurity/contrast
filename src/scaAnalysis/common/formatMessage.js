const createJavaTSMessage = javaTree => {
  return {
    java: {
      mavenDependencyTrees: javaTree
    }
  }
}

const createJavaScriptTSMessage = js => {
  let message = {
    node: {
      packageJSON: js.packageJSON
    }
  }
  if (js.yarn !== undefined) {
    message.node.yarnLockFile = js.yarn.yarnLockFile
    message.node.yarnVersion = js.yarn.yarnVersion
  } else {
    message.node.npmLockFile = js.npmLockFile
  }
  return message
}

const createGoTSMessage = goTree => {
  return {
    go: {
      goDependencyTrees: goTree
    }
  }
}

const createRubyTSMessage = rubyTree => {
  return {
    ruby: rubyTree
  }
}

const createPythonTSMessage = pythonTree => {
  return {
    python: pythonTree
  }
}

const createPhpTSMessage = phpTree => {
  return {
    php: {
      composerJSON: phpTree.composerJSON,
      lockFile: phpTree.lockFile
    }
  }
}

const createDotNetTSMessage = dotnetTree => {
  return {
    dotnet: dotnetTree
  }
}

module.exports = {
  createJavaScriptTSMessage,
  createJavaTSMessage,
  createGoTSMessage,
  createPhpTSMessage,
  createRubyTSMessage,
  createPythonTSMessage,
  createDotNetTSMessage
}
