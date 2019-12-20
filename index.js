require("@babel/register")({
    presets: [
      ["@babel/preset-env",
      {
        "targets": {
          "node": "10"
        }
      }]
    ]
  });
  
  module.exports = require('./server.js')