const chokidar = require('chokidar');
const { generateDocsMap } = require('./generate-docs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '../documents');

// Initialize watcher
const watcher = chokidar.watch(DOCS_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
});

// Add event listeners
watcher
    .on('add', path => {
        console.log(`File ${path} has been added`);
        generateDocsMap();
    })
    .on('change', path => {
        console.log(`File ${path} has been changed`);
        generateDocsMap();
    })
    .on('unlink', path => {
        console.log(`File ${path} has been removed`);
        generateDocsMap();
    });

console.log('Watching for changes in documents directory...'); 