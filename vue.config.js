const WorkerPlugin = require('worker-plugin')

module.exports = {
  chainWebpack: (config) => {
    config
      .plugin('define')
        .tap(args => {
          const pkg = require('./package.json')
          args[0]['process.env']['VERSION'] = JSON.stringify(pkg.version)
          args[0]['process.env']['DESCRIPTION'] = JSON.stringify(pkg.description)
          args[0]['process.env']['HOMEPAGE'] = JSON.stringify(pkg.homepage)
          return args
        })
  },
  configureWebpack: {
    plugins: [
      new WorkerPlugin()
    ]
  }
}
