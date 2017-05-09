[![npm version](https://badge.fury.io/js/extract-package.svg)](https://badge.fury.io/js/extract-package) 

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
  name: 'lodash'
}).then(response => {
  // folder location
}).catch(error => {
  // oops!
})
```

### Specify a version

```js
extractPackage({
  name: 'lodash',
  version: '1.0.0'
})
```

### Specify where to drop the package

```js
extractPackage({
  name: 'lodash',
  version: '1.0.0',
  dest: '/path/to/folder'
})
```

### Satisfy major versions

Assuming that the package version are 1.4.5, 1.6.5 and 2.0.0, this example will download the version 1.6.5, which is the latest version that satisfies that major version.

```js
extractPackage({
  name: 'lodash',
  version: '1'
}, true)
```
