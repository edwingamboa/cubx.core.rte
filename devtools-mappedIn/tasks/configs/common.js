'use strict';

module.exports.tasks = {

  githooks: {
    all: {
      options: {
        dest: '../.git/hooks'
      },
      'pre-commit': '_validateSources'
    }
  },
  karma: {
    cif: {
      configFile: '<%= param.src %>/cif/test/karma.conf.js',
      singleRun: true
    },
    crc: {
      configFile: '<%= param.src %>/crc/test/karma.conf.js',
      singleRun: true
    },
    'crc-loader': {
      configFile: '<%= param.src %>/crc-loader/test/karma.conf.js',
      singleRun: true
    },
    cubxpolymer: {
      configFile: '<%= param.src %>/cubxpolymer/test/karma.conf.js',
      singleRun: true
    },
    'dynamic-connection-utils': {
      configFile: '<%= param.src %>/dynamic-connection-utils/test/karma.conf.js',
      singleRun: true
    }

  }
};
