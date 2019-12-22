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
  }
}
