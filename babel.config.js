module.exports = {
  babelrcRoots: [__dirname, __dirname + "/common"],
  presets: [
    [
      "@babel/preset-env", {
        "targets": {
          "node": "current"
        }
      }
    ]
  ],
};
