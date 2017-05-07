const fetch = require('node-fetch')
const targz = require('tar.gz')
const fs = require('fs')
const tempDir = require('temp-dir')

var currentNodeVersion = process.versions.node
if (currentNodeVersion.split('.')[0] < 6) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create NPM package requires Node 6 or higher. \n' +
      'Please update your version of Node.'
  )
  process.exit(1);
}

/**
 * Create a Promise that resolves when a stream ends and rejects when an error occurs
 * @param {WritableStream|ReadableStream} stream
 * @returns {Promise}
 */
function whenStreamDone (stream) {
  return new Promise(function (resolve, reject) {
    stream.on('end', resolve)
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

/**
 * Extracts node package tarball based on semver version string
 * @param  {String} name    package name
 * @param  {String} version semver string
 * @param  {String} dest    package destination folder
 * @return {Object}         downloaded package
 */
module.exports = function extractPackage ({ name, version, dest }) {
  const tarFilePath = `${tempDir}/${name}.tar.gz`
  let packageVersion

  if (!fs.existsSync(dest)) {
    console.error(`Directory ${dest} doesn't exist`)
    process.exit(1)
  }

  return fetch(`http://registry.npmjs.org/${name}`).then(response => {
    return response.json()
  })
  .then(info => {
    const versions = Object.keys(info.versions)

    packageVersion = info.versions[version]

    if (!packageVersion) {
      console.error(`Version ${version} doesn't exist for this package.`)
      process.exit(1)
    }

    return packageVersion.dist.tarball
  })
  .then(url => {
    return fetch(url).then(response => {
      const file = fs.createWriteStream(tarFilePath)
      response.body.pipe(file)

      return whenStreamDone(response.body).then(() => {
        return targz().extract(tarFilePath, dest)
      })
    })
  })
  .then(() => packageVersion)
}
