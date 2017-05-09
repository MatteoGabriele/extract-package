const fs = require('fs')
const fetch = require('node-fetch')
const targz = require('tar.gz')
const tempDir = require('temp-dir')
const semver = require('semver')

var currentNodeVersion = process.versions.node
if (currentNodeVersion.split('.')[0] < 6) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'Create NPM package requires Node 6 or higher. \n' +
      'Please update your version of Node.'
  )
  process.exit(1)
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
 * [extractPackage description]
 * @param  {String}  name                 package name
 * @param  {String}  version              semver string
 * @param  {String}  dest                 package destination folder
 * @param  {Boolean} [satisfyMajor=false] satisfy major version
 * @return {String}                       package folder destination
 */
module.exports = function extractPackage ({ name, version, dest }, satisfyMajor = false) {
  const tarFilePath = `${tempDir}/${name}.tar.gz`

  if (!fs.existsSync(dest)) {
    console.error(`Directory ${dest} doesn't exist`)
    process.exit(1)
  }

  return fetch(`http://registry.npmjs.org/${name}`).then(response => {
    return response.json()
  })
  .then(info => {
    const versions = Object.keys(info.versions)

    let selectedVersion = satisfyMajor ? semver.maxSatisfying(versions, `^${version}.0.0`) : version

    if (satisfyMajor && !selectedVersion) {
      console.log(`${version} doesn\'t satisfy any major versions of ${name}`)
      process.exit(1)
    }

    if (!selectedVersion) {
      console.error(`Version ${version} doesn't exist for ${name}.`)
      process.exit(1)
    }

    return info.versions[selectedVersion].dist.tarball
  })
  .then(url => {
    return fetch(url).then(response => {
      const file = fs.createWriteStream(tarFilePath)
      response.body.pipe(file)

      return whenStreamDone(response.body).then(() => {
        return targz().extract(tarFilePath, dest).then(() => {
          return `${dest}/package`
        })
      })
    })
  })
}
