const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');

// Configuration
const HTML_DIR = path.join(__dirname, '../html-pages'); // Directory containing HTML files to parse
const OUTPUT_FILE = path.join(__dirname, '../.dist/link-map.json');
const DOCS_DIR = path.join(__dirname, '../documents'); // Where documents will be stored

async function generateLinkMap() {
    try {
        // Ensure the HTML directory exists
        await fs.ensureDir(HTML_DIR);
        
        // Get all HTML files
        const htmlFiles = await getAllFiles(HTML_DIR, ['.html', '.htm']);
        
        // Create the link map
        const linkMap = {};
        
        for (const htmlFile of htmlFiles) {
            const pageName = path.basename(htmlFile, path.extname(htmlFile));
            const content = await fs.readFile(htmlFile, 'utf-8');
            const $ = cheerio.load(content);
            
            const pageLinks = [];
            
            // Find all links
            $('a').each((i, element) => {
                const href = $(element).attr('href');
                const text = $(element).text().trim();
                
                // Only include links that point to documents (PDF, DOC, etc.)
                if (href && text && isDocumentLink(href)) {
                    pageLinks.push({
                        text,
                        url: href,
                        type: getFileType(href)
                    });
                }
            });
            
            if (pageLinks.length > 0) {
                linkMap[pageName] = pageLinks;
            }
        }

        // Ensure the output directory exists
        await fs.ensureDir(path.dirname(OUTPUT_FILE));
        
        // Write the JSON file
        await fs.writeJson(OUTPUT_FILE, {
            lastGenerated: new Date().toISOString(),
            pages: linkMap
        }, { spaces: 2 });

        console.log(`Generated link map with ${Object.keys(linkMap).length} pages`);
        
        // Create a summary of documents to download
        const allDocuments = new Set();
        Object.values(linkMap).forEach(links => {
            links.forEach(link => allDocuments.add(link.url));
        });
        
        console.log('\nDocuments to download:');
        console.log(Array.from(allDocuments).join('\n'));
        
    } catch (error) {
        console.error('Error generating link map:', error);
        process.exit(1);
    }
}

function isDocumentLink(url) {
    const documentExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.mp4'];
    return documentExtensions.some(ext => url.toLowerCase().endsWith(ext));
}

function getFileType(url) {
    const ext = path.extname(url).toLowerCase().slice(1);
    return ext || 'unknown';
}

async function getAllFiles(dir, extensions = []) {
    const files = await fs.readdir(dir);
    const allFiles = [];

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            const subFiles = await getAllFiles(filePath, extensions);
            allFiles.push(...subFiles);
        } else if (extensions.length === 0 || extensions.includes(path.extname(file).toLowerCase())) {
            allFiles.push(filePath);
        }
    }

    return allFiles;
}

// Run the generator
generateLinkMap(); 