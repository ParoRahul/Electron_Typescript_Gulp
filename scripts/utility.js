
module.exports.getPortOrDefault = () => {
  const port = process.env.PORT
  if (port != null) {
      const result = parseInt(port)
      if (isNaN(result)) {
          throw new Error(`Unable to parse '${port}' into valid number`)
      }
      return result
  }
  return 3000
}