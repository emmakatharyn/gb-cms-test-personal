const fs = require('fs-extra');
const path = require('path');

// Configuration
const CONTENT_FOLDER = process.argv[2] || '../content'; // Default to ../content, can be overridden
const OUTPUT_FILE = path.join(__dirname, '../content-map/content-structure.json');
const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.html', '.htm'];

/**
 * Recursively scan a directory and return all files with their relative paths
 */
function scanDirectory(dirPath, basePath = '') {
    const files = [];
    
    try {
        const items = fs.readdirSync(dirPath);
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const relativePath = path.join(basePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Recursively scan subdirectories
                const subFiles = scanDirectory(fullPath, relativePath);
                files.push(...subFiles);
            } else if (stat.isFile()) {
                // Check if file has supported extension
                const ext = path.extname(item).toLowerCase();
                if (SUPPORTED_EXTENSIONS.includes(ext)) {
                    files.push(relativePath);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return files;
}

/**
 * Group files by their immediate parent directory (page)
 */
function groupFilesByPage(files) {
    const pages = {};
    
    for (const file of files) {
        const pathParts = file.split(path.sep);
        const pageName = pathParts[0]; // First directory is the page
        
        if (!pages[pageName]) {
            pages[pageName] = [];
        }
        
        pages[pageName].push(file);
    }
    
    return pages;
}

/**
 * Merge existing content with new files, preserving order and section headers
 */
function mergeWithExistingContent(newFiles, existingContent) {
    if (!existingContent || !Array.isArray(existingContent)) {
        // If no existing content, just return new files
        return newFiles;
    }
    
    const result = [];
    const newFilesSet = new Set(newFiles);
    
    // Keep existing items (files and section headers) that still exist
    for (const item of existingContent) {
        if (item.startsWith('#')) {
            // Keep section headers
            result.push(item);
        } else if (newFilesSet.has(item)) {
            // Keep existing files that still exist
            result.push(item);
            newFilesSet.delete(item); // Remove from set to track what's been added
        }
        // Skip files that no longer exist
    }
    
    // Add new files at the end
    for (const newFile of newFiles) {
        if (newFilesSet.has(newFile)) {
            result.push(newFile);
        }
    }
    
    return result;
}

/**
 * Generate the content structure JSON
 */
function generateContentMap() {
    console.log(`Scanning content folder: ${CONTENT_FOLDER}`);
    
    try {
        // Check if content folder exists
        if (!fs.existsSync(CONTENT_FOLDER)) {
            console.error(`Content folder not found: ${CONTENT_FOLDER}`);
            console.log('Please provide the correct path to your content folder as an argument.');
            console.log('Usage: node generate-map.js <content-folder-path>');
            return;
        }
        
        // Load existing content if it exists
        let existingMap = {};
        if (fs.existsSync(OUTPUT_FILE)) {
            try {
                existingMap = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
                console.log('Found existing content map, will preserve order and section headers');
            } catch (error) {
                console.log('Could not parse existing content map, starting fresh');
            }
        }
        
        // Scan all files in the content directory
        const allFiles = scanDirectory(CONTENT_FOLDER);
        console.log(`Found ${allFiles.length} files`);
        
        // Group files by page
        const newFilesByPage = groupFilesByPage(allFiles);
        
        // Merge with existing content
        const contentMap = {};
        for (const [pageName, newFiles] of Object.entries(newFilesByPage)) {
            const existingContent = existingMap[pageName] || [];
            contentMap[pageName] = mergeWithExistingContent(newFiles, existingContent);
        }
        
        // Ensure output directory exists
        const outputDir = path.dirname(OUTPUT_FILE);
        fs.ensureDirSync(outputDir);
        
        // Write the JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(contentMap, null, 2));
        
        console.log(`Content map generated successfully: ${OUTPUT_FILE}`);
        console.log(`Generated ${Object.keys(contentMap).length} pages:`);
        
        // Display summary
        for (const [pageName, files] of Object.entries(contentMap)) {
            const fileCount = files.filter(item => !item.startsWith('#')).length;
            const sectionCount = files.filter(item => item.startsWith('#')).length;
            console.log(`  - ${pageName}: ${fileCount} files, ${sectionCount} section headers`);
        }
        
    } catch (error) {
        console.error('Error generating content map:', error);
    }
}

// Main execution
if (require.main === module) {
    generateContentMap();
}

module.exports = {
    generateContentMap,
    scanDirectory,
    groupFilesByPage,
    mergeWithExistingContent
};
