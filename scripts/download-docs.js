const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');

const LINK_MAP_FILE = path.join(__dirname, '../.dist/link-map.json');
const DOCS_DIR = path.join(__dirname, '../documents');

async function downloadDocuments() {
    try {
        // Read the link map
        const linkMap = await fs.readJson(LINK_MAP_FILE);
        
        // Create documents directory
        await fs.ensureDir(DOCS_DIR);
        
        // Get all unique document URLs
        const allDocuments = new Set();
        Object.values(linkMap.pages).forEach(links => {
            links.forEach(link => allDocuments.add(link.url));
        });
        
        console.log(`Found ${allDocuments.size} unique documents to download`);
        
        // Download each document
        for (const docUrl of allDocuments) {
            const parsedUrl = url.parse(docUrl);
            const fileName = path.basename(parsedUrl.pathname);
            const outputPath = path.join(DOCS_DIR, fileName);
            
            // Skip if file already exists
            if (await fs.pathExists(outputPath)) {
                console.log(`Skipping ${fileName} - already exists`);
                continue;
            }
            
            console.log(`Downloading ${fileName}...`);
            
            await new Promise((resolve, reject) => {
                const protocol = parsedUrl.protocol === 'https:' ? https : http;
                
                protocol.get(docUrl, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Failed to download ${docUrl}: ${response.statusCode}`));
                        return;
                    }
                    
                    const file = fs.createWriteStream(outputPath);
                    response.pipe(file);
                    
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                }).on('error', (err) => {
                    reject(err);
                });
            });
        }
        
        console.log('Download complete!');
        
    } catch (error) {
        console.error('Error downloading documents:', error);
        process.exit(1);
    }
}

// Run the downloader
downloadDocuments(); 