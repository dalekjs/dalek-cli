#!/usr/bin/env node

'use strict';

var spawn = require('child_process').spawn;
var optimist = require('optimist');
var colors = require('colors');

// Search for installed dalek by using node's built-in require() logic.
var child = spawn(process.execPath, ['-p', '-e', 'require.resolve("dalekjs")']);
var dalekpath = '';
child.stdout.on('data', function (data) {
    dalekpath += data;
});

// when the child process exists, dalek-cli will check
// if a local dalekjs installation exists, if so,
// it will check the parameters
child.on('exit', function(code) {
  // Removing trailing newline from stdout.
  dalekpath = dalekpath.trim();
  // If a local dalek isn't found, throw an error an exit
  if (code !== 127 && dalekpath) {
    var argv = optimist
        .usage('Usage: dalek [test files] {OPTIONS}')
        .wrap(80)
        .option('reporter', {
            alias: 'r',
            type : 'string',
            desc : 'Reporter(s) you would like to invoke'
        })
        .option('driver', {
            alias: 'd',
            type : 'string',
            desc : 'Driver(s) you would like to invoke'
        })
        .option('browser', {
            alias: 'b',
            type : 'string',
            desc : 'Browser(s) you would like to invoke \n(Only for multibrowser drivers like selenium)'
        })
        .option('logLevel', {
            alias: 'l',
            type : 'number',
            desc : 'Log level, controls the amount of information outputted to the console'
        })
        .option('no-colors', {
            type : 'boolean',
            desc : 'Disable colorized output in the console'
        })
        .option('no-symbols', {
            type : 'boolean',
            desc : 'Disable UTF-8 symbols in the console'
        })
        .option('help', {
            alias : 'h',
            desc : 'Show this message'
        })
        .check(function (argv) {
            if (argv.help) throw '';
        })
        .argv;

        // run dalekjs
        require(dalekpath)({
            tests: argv._,
            driver: argv.driver ? argv.driver.split(',') : [],
            reporter: argv.reporter ? argv.reporter.split(',') : [],
            browser: argv.browser ? argv.browser.split(',') : [],
            logLevel: argv.logLevel
        }).run();

    } else {
        console.log('No local dalekjs installation found'.red);
        console.log('Please follow the instruction here: http://dalekjs.com/docs/usage'.yellow);
        process.exit(127);
    }
});
