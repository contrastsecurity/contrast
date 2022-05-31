module.exports = exports = ({ dotnet }, next) => {
  // Remove anything sensitive or unnecessary from being sent to the backend as
  // a result of our .NET project analysis
  delete dotnet.rawProjectFileContents
  delete dotnet.parsedProjectFileContents
  delete dotnet.projectFileXML
  delete dotnet.packageReferences
  delete dotnet.rawLockFileContents

  next()
}
