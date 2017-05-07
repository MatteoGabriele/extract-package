# extract-package

Download and extract npm package version

## Requires

Node 6+

## Install

```bash
$ npm install extract-package
```

## Usage

```js
const extractPackage = require('extract-package')

extractPackage({
  name: 'extract-package',
  version: '1.0.0',
  dest: '/path/to/folder'
}).then(downloadedPackage => {
  console.log(downloadedPackage)
}).catch(error => {
  // some error
})
```