/* #############################################################################
 * Title: Gruntfile.js
 * Desc: The grunt build configuration file. Don't really need to touch this,
 * unless you feel like breaking everything.....
 * Author: Anthony Del Ciotto
 * Date: 14th January 2015
 * License: MIT
 * #############################################################################
*/

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // if some scripts depend upon eachother,
  // make sure to list them here in order
  // rather than just using the '*' wildcard.
  var srcFiles = [
    '<%= dirs.src %>/lib/polyfill.js',
    '<%= dirs.src %>/app.js'
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    dirs: {
        build: 'build/js',
        src: 'app/js',
    },
    files: {
        srcBlob: '<%= dirs.src %>/**/*.js',
        build: '<%= dirs.build %>/main.min.js'
    },

    clean: {
      build: {
        src: ['<%= dirs.build %>/*.js']
      }
    },

    jshint: {
      files: ['Gruntfile.js', '<%= files.srcBlob %>', '!<%= dirs.src %>/lib/*.js']
    },

    uglify: {
      target: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true,
          sourceMapRoot: '<%= dirs.src %>'
        },
        files: { '<%= files.build %>': srcFiles }
      },
    },

    express: {
      all: {
        options: {
          port: 6080,
          hostname: "0.0.0.0",
          bases: ['build'],
        }
      }
    },

    watch: {
      options: { livereload: true },
      html: {
        files: ['build/*.html']
      },
      styles: {
        files: ['build/css/styles.css']
      },
      scripts: {
        files: ['Gruntfile.js', '<%= files.srcBlob %>' ],
        tasks: ['build']
      }
    },
  });

  grunt.registerTask('lint', 'Perform a lint on all the js source files', ['jshint']);
  grunt.registerTask('build', 'Clean the build directory and concat + minify all js source files', ['clean', 'lint', 'uglify']);
  grunt.registerTask('default', 'Watch all js and css files for changes and rebuld appropriatly',
                    ['lint', 'build', 'express', 'watch']);
};
