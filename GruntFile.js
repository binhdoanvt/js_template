/* #####################################################################
 * Title: GruntFile.js
 * Desc: The grunt build configuration file.
 * Author: Anthony Del Ciotto
 * Date: 24th October 2014
 * License: MIT
 * #################################################################### */

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  // if some scripts depend upon eachother,
  // make sure to list them here in order
  // rather than just using the '*' wildcard.
  var srcFiles = [
    // '<%= dirs.src %>/lib/dependeny.js',
    '<%= dirs.src %>/app.js'
  ];
  var banner = [
    '/**',
    ' * @license',
    ' * <%= pkg.name %> - v<%= pkg.version %>',
    ' * Copyright (c) 2014, Anthony Del Ciotto',
    ' *',
    ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
    ' *',
    ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
    ' */',
    ''
  ].join('\n');


  // object to represent the type of environment we are running in.
  // eg. production or development
  var EnvType = {
    prod: 'production',
    dev: 'development'
  };

  // configure the tasks
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // object to represent our source and final build directorys
    dirs: {
        build: 'dist',
        src: 'src',
    },
    files: {
        srcBlob: '<%= dirs.src %>/**/*.js',
        build: '<%= dirs.build %>/app.dev.js',
        buildMin: '<%= dirs.build %>/app.min.js'
    },

    // wipe the build directory clean
    clean: {
      build: {
        src: ['<%= dirs.build %>']
      }
    },

    // configure concatenation for the js: for dev mode.
    // this task will only concat files. useful for when in development
    // and debugging as the file will be readable.
    concat: {
      options: {
        banner: banner
      },
      dist: {
        src: srcFiles,
        dest: '<%= files.build %>'
      }
    },

    // configure minification for the js: for prod mode.
    // this task both concatenates and minifies the files.
    uglify: {
      target: {
        options: {
          banner: banner,
          mangle: false
        },
        files: {
          '<%= files.buildMin %>': srcFiles
        }
      },
    },


    // grunt-express will serve the files from the folders listed in `bases`
    // on specified `port` and `hostname`
    express: {
      all: {
        options: {
          port: 3000,
          hostname: "0.0.0.0",
          bases: ['./'],
        }
      }
    },

    // configure grunt-watch to monitor the projects files
    // and perform each specific file type build task.
    watch: {
      options: {
        livereload: true
      },

      scripts: {
        files: ['<%= files.srcBlob %>' ],
        tasks: ['concat']
      }
    },

    // grunt-open will open your browser at the project's URL
    open: {
      all: {
        // Gets the port from the connect configuration
        path: 'http://localhost:<%= express.all.options.port%>'
      }
    }
  });

  /**
   * Utility function to register the scripts task to grunt.
   * @param  {[EnvType]} mode  [the mode, either dev, or production]
   */
  var registerScriptsTask = function(mode) {
    // if we are running in dev mode, only concat the scripts
    // otherwise minify them also
    var scriptTask = (mode === EnvType.prod) ? 'uglify:target' :
      'concat';

    grunt.registerTask('scripts:' + mode,
      'Compiles the javascript files in ' + mode + ' mode',
      [scriptTask]
    );
  };

  /**
   * Utility function to register the build task to grunt.
   * @param  {[type]} mode  [the mode, either dev, or production]
   */
  var registerBuildTask = function(mode) {
    grunt.registerTask('build:' + mode, 
      'Compiles all of the assets and copies them' +
      ' to th build directory', 
      ['clean', 'scripts:' + mode]
    );
  };

  /**
   * Utility function to register the server task to grunt.
   * @param  {[type]} mode  [the mode, either dev, or production]
   */
  var registerServerTask = function(mode) {
    var tasks = ['express', 'open'];

    // if we are running in development mode, run the watch task
    if (mode === EnvType.dev) {
      tasks.push('watch');
    } else if (mode === EnvType.prod) {
      tasks.push('express-keepalive');
    }

    grunt.registerTask('server:' + mode,
      'Begins the express server and opens it in a browser' +
      'constantly watching for changes', 
      tasks
    );
  }; 

  /**
   * Utility function to register the main task to grunt.
   * @param  {[type]} mode  [the mode, either dev, or production]
   */
  var registerMainTask = function(mode) {
    grunt.registerTask(mode, 
      'Watches the project for changes' +
      'automatically builds them and runs a server', 
      ['build:' + mode, 'server:' + mode]
    );
  };

  // register all the tasks for both development and production
  registerScriptsTask(EnvType.dev);
  registerScriptsTask(EnvType.prod);
  registerBuildTask(EnvType.dev);
  registerBuildTask(EnvType.prod);
  registerServerTask(EnvType.dev);
  registerServerTask(EnvType.prod);
  registerMainTask(EnvType.dev);
  registerMainTask(EnvType.prod);

  // register development mode as the main task
  grunt.registerTask('default', 'Default task: development', 'development');
};
