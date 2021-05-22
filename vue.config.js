module.exports = {
  pwa: {
    name: 'draw'
  },

  publicPath: process.env.NODE_ENV === 'production'? '/draw/' : '/'
}