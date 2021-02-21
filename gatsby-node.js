exports.onCreateWebpackConfig = function({ actions, plugins }) {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        buffer: 'buffer'
      }
    },
    plugins: [
      plugins.provide({
        Buffer: ['buffer', 'Buffer']
      }),
    ],
  })
}
