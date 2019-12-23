module.exports = {
  parallel: false,
  chainWebpack: (config) => {
    config.module
      .rule('js').exclude
      .add(/\.worker\.js$/i)
      .end()
    config.module
      .rule('worker')
      .test(/\.worker\.js$/i)
      .use('worker-loader')
        .loader('worker-loader')
        .end()
    config
      .plugin('define')
        .tap(args => {
          const pkg = require('./package.json')
          args[0]['process.env']['VERSION'] = JSON.stringify(pkg.version)
          args[0]['process.env']['DESCRIPTION'] = JSON.stringify(pkg.description)
          args[0]['process.env']['HOMEPAGE'] = JSON.stringify(pkg.homepage)
          return args
        })
  }
}
