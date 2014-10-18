module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: ["dist", '.tmp'],

        copy: {
            main: {
                expand: true,
                cwd: 'app/',
                src: ['index.html', '**/*.{ico,png}', 'jatennis.appcache'],
                dest: 'dist/'
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/**/*.js', '!**/*.min.js', '!**/_*.js'],
                dest: 'dist/jatennis.js'
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
                cwd: 'app/style/',
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
                    //selector: 'body',       // (Optional) CSS selector of the element to use to insert the templates. Default is `body`.
                    //method: 'prepend',       // (Optional) DOM insert method. Default is `prepend`.
                    unescape: {             // (Optional) List of escaped characters to unescape
                        '&lt;': '<',
                        '&gt;': '>',
                        '&apos;': '\'',
                        '&amp;': '&'
                    }
                },
                files: {
                    'dist/index.html': ['app/*/*.html', '!**/_*.html']
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
        }
    });

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // Tell Grunt what to do when we type "grunt" into the terminal
    grunt.registerTask('default', [
        'copy:main',
	    'inline_angular_templates',
        'targethtml',
	    //'htmlclean',
	    'useminPrepare',
	    'concat',
	    'uglify',
	    'cssmin',
	    //'filerev', 
	    'usemin'
    ]);
};