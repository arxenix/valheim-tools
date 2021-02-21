exports.onCreateWebpackConfig = function({ stage, loaders, actions, plugins }) {
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

  if (stage === "build-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /jsoneditor/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}
