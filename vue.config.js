module.exports = {
  devServer: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: "all"
  },
  configureWebpack: {
    resolve: {
      fallback: {
        "crypto": false
      }
    }
  }
}