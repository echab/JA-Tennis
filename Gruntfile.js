module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        tsconfig: {
            make:{
                options: {
                    /* The main feature is to put files in your tsconfig.json file based on this filesGlob... */
                    filesGlob: [
                        "./app/**/*.ts",
                        "./test/unit/**/*Spec.ts",
                        "./lib/**/*.d.ts",
                        "!./app/JATennis.d.ts",
                        "!./lib/**/*mock*.d.ts",
                        "!./lib/**/angular*1.0*.d.ts",
                        "!./lib/**/angular*scenario*.d.ts",
                        "!./node_modules/**/*.ts"
                    ],
     
                    /* if rootDir is provided, this will be the output-destination of the file, and the starting-point of the filesGlob */
                    /* rootDir:'scripts/', */
     
                    /* Anything added to "additionalOptions" will also be put into the tsconfig.json file */
                    additionalOptions: {
                        compilerOptions:{
                            "version":"1.5.0",
                            "target": "es3",
                            "module": "amd",
                            "declaration": false,
                            "noImplicitAny": false,
                            "removeComments": false,
                            "noLib": false,
                            "sourceMap": true
                        },
                        exclude: [
                            "app/JATennis.d.ts",
                            "lib/typings/angularjs/angular-mocks.d.ts",
                            "lib/typings/angularjs/angular-scenario-1.0.d.ts",
                            "lib/typings/angularjs/angular-1.0.d.ts",
                            "lib/typings/angularjs/angular-cookies-1.0.d.ts",
                            "lib/typings/angularjs/angular-mocks-1.0.d.ts",
                            "lib/typings/angularjs/angular-resource-1.0.d.ts",
                            "lib/typings/angularjs/angular-sanitize-1.0.d.ts",
                            "lib/typings/angularjs/angular-scenario-1.0.d.ts",
                            "lib/typings/angularjs/angular-scenario.d.ts",
                            "lib/typings/mocks/math-mock.d.ts",
                            "lib/typings/ui-bootstrap/ui-bootstrap-mocks.d.ts",
                            "node_modules"
                        ]
                    }
                }
            }
        },

        clean: ["dist", '.tmp'],

        copy: {
            main: {
                expand: true,
                cwd: 'app/',
                src: ['index.html', '**/*.{ico,png}', 'jatennis.appcache', '.htaccess'],
                dest: 'dist/'
            }
        },

        concat: {
            options: {
                separator: ''
            },
            dist: {
                src: ['app/**/*.js', '!**/*.min.js', '!**/_*.js'],
                dest: 'dist/jatennis.js'
            },
            distCss: {
                src: ['app/**/*.css', '!**/*.min.css', '!**/_*.css'],
                dest: 'dist/style/app.css'
            }
        },

        rev: {
            files: {
                src: ['dist/**/*.{js,css}', '!dist/js/shims/**']
            }
        },

        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },

        usemin: {
            html: ['dist/index.html']
        },

        cssmin: {
            minify: {
                expand: true,
                cwd: 'dist/style/',
                src: ['*.css', '!*.min.css'],
                dest: 'dist/style/',
                ext: '.min.css'
            }
        },

        htmlclean: {
            options: {
                //protect: /<\!--%fooTemplate\b.*?%-->/g,
                //edit: function(html) { return html.replace(/\begg(s?)\b/ig, 'omelet$1'); }
            },
            deploy: {
                expand: true,
                cwd: 'dist/',
                src: '**/*.html',
                dest: 'dist/'
            }
        },

        targethtml: {
            dist: {
                files: {
                    'dist/index.html': 'dist/index.html'
                }
            }
        },

        inline_angular_templates: {
            dist: {
                options: {
                    base: 'app', // (Optional) ID of the <script> tag will be relative to this folder. Default is project dir.
                    //prefix: '/',            // (Optional) Prefix path to the ID. Default is empty string.
                    selector: 'head',       // (Optional) CSS selector of the element to use to insert the templates. Default is `body`.
                    method: 'append',       // (Optional) DOM insert method. Default is `prepend`.
                    unescape: {             // (Optional) List of escaped characters to unescape
                        '&lt;': '<',
                        '&gt;': '>',
                        '&apos;': '\'',
                        '&amp;': '&'
                    }
                },
                files: {
                    'dist/index.html': ['app/**/*.html', '!app/index*.html', '!**/_*.html']
                }
            }
        },

        //ngAnnotate: {
        //	options: {
        //		// Task-specific options go here.
        //		singleQuotes: true
        //	},
        //	app: {
        //		// Target-specific file lists and/or options go here.
        //		files: {
        //			'a.js': ['a.js'],
        //			'c.js': ['b.js'],
        //			'f.js': ['d.js', 'e.js'],
        //		},
        //	},
        //},

        uglify: {
            options: {
                report: 'min',
                mangle: true,
                compress: {
                    drop_debugger: true,
                    dead_code: false,
                    unused: false,
                },
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/jatennis.min.js': ['dist/jatennis.js']
                }
            }
        },

        'string-replace': {
            version: {
                files: {
                    'dist/jatennis.appcache': 'dist/jatennis.appcache'
                },
                options: {
                    replacements: [{
                        pattern: /{{ VERSION }}/g,
                        replacement: '<%= pkg.version %>'
                    }, {
                        pattern: /{{ DATE }}/g,
                        replacement: '<%= grunt.template.today("yyyy-mm-dd HH:MM") %>'
                    }]
                }
            }
        },

        compress: {
            main: {
                options: {
                    mode: 'zip',
                    archive: function () {
                        return '../backup/JA-Tennis_' + grunt.template.today("yyyy-mm-dd_HH_MM_ss") + '.zip';
                    }
                },
                files: [
                    {
                        src: [
                            '**/*.{ts,html,css,ico,png,appcache,cmd,sln,vbproj,config}',
                            '**/{math-mock,ui-bootstrap-mocks}.js',
                            'package.json',
                            '.htaccess',
                            '*file.js',
                            '!node_modules/**', '!lib/angular/**', '!lib/ui-bootstrap/**', '!lib/typings/**', '!dist/**', '!bin/**'],
                        dest: '/'
                    }
                ]
            }
        },

        'ftp-deploy': {
            free: {
                auth: {
                    host: 'ftpperso.free.fr',
                    port: 21,
                    authKey: 'free1'
                },
                src: 'dist',
                dest: '/2.0',
                exclusions: ['dist/**/Thumbs.db']
            }
        }

    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Tell Grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('default', [
        'copy:main',
        'string-replace:version',
        //'htmlclean',
        'inline_angular_templates',
        'targethtml',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        //'filerev', 
        'usemin'
    ]);

    grunt.registerTask('backup', [
        'compress:main'
    ]);

    grunt.registerTask('publish', [
        //'default',
        'ftp-deploy:free'
    ]);

};