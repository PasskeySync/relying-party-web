const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({     //遇见/api前缀的请求，触发该代理配置
      target: 'http://localhost:8080',        //请求转发给谁
      changeOrigin: true,                     //控制服务器收到的请求头中Host的值，默认值 false
      pathRewrite: { '^/api': '' }            //重写请求路径
    }),
  )
}