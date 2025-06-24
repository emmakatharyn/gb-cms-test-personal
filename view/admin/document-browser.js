class DocumentBrowser {
    constructor(containerId, linkMap) {
        this.container = document.getElementById(containerId);
        this.linkMap = linkMap;
        this.currentPage = null;
        this.init();
    }

    init() {
        // Create main container
        this.container.innerHTML = `
            <div class="document-browser">
                <div class="pages-list"></div>
                <div class="documents-list"></div>
            </div>
        `;

        // Get references to containers
        this.pagesList = this.container.querySelector('.pages-list');
        this.documentsList = this.container.querySelector('.documents-list');

        // Render pages
        this.renderPages();
    }

    renderPages() {
        const pages = Object.keys(this.linkMap.pages);
        const pagesHtml = pages.map(page => `
            <div class="page-item" data-page="${page}">
                ${this.formatPageName(page)}
            </div>
        `).join('');

        this.pagesList.innerHTML = pagesHtml;

        // Add click handlers
        this.pagesList.querySelectorAll('.page-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showDocuments(item.dataset.page);
            });
        });
    }

    showDocuments(pageName) {
        this.currentPage = pageName;
        const documents = this.linkMap.pages[pageName];
        
        const documentsHtml = documents.map(doc => `
            <div class="document-item">
                <a href="${doc.url}" target="_blank" class="document-link">
                    <span class="document-text">${doc.text}</span>
                    <span class="document-type">${doc.type}</span>
                </a>
            </div>
        `).join('');

        this.documentsList.innerHTML = `
            <h2>${this.formatPageName(pageName)}</h2>
            <div class="documents-container">
                ${documentsHtml}
            </div>
        `;

        // Update active state
        this.pagesList.querySelectorAll('.page-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageName);
        });
    }

    formatPageName(pageName) {
        // Convert camelCase or hyphenated to Title Case with spaces
        return pageName
            .replace(/([A-Z])/g, ' $1')
            .replace(/-/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
}

class UploadPanel {
    constructor(containerId, linkMap) {
        this.container = document.getElementById(containerId);
        this.linkMap = linkMap;
        this.init();
    }

    init() {
        this.populatePageSelect();
        this.setupEventListeners();
        this.setupTabNavigation();
    }

    populatePageSelect() {
        const pageSelect = document.getElementById('document-page');
        const pages = Object.keys(this.linkMap.pages);
        
        pages.forEach(page => {
            const option = document.createElement('option');
            option.value = page;
            option.textContent = this.formatPageName(page);
            pageSelect.appendChild(option);
        });
    }

    setupEventListeners() {
        const form = document.getElementById('upload-form');
        const resetBtn = document.getElementById('reset-form');
        const fileInput = document.getElementById('document-file');

        form.addEventListener('submit', (e) => this.handleUpload(e));
        resetBtn.addEventListener('click', () => this.resetForm());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => content.classList.remove('active'));
                if (targetTab === 'browser') {
                    document.getElementById('document-browser-container').classList.add('active');
                } else if (targetTab === 'upload') {
                    document.getElementById('upload-container').classList.add('active');
                }
            });
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        const typeSelect = document.getElementById('document-type');
        
        if (file) {
            const extension = file.name.split('.').pop().toLowerCase();
            typeSelect.value = extension;
        }
    }

    async handleUpload(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const file = formData.get('document');
        const text = formData.get('text');
        const page = formData.get('page');
        const type = formData.get('type');

        if (!file || !text || !page || !type) {
            this.showStatus('Please fill in all required fields.', 'error');
            return;
        }

        try {
            // Simulate file upload (in a real implementation, you'd upload to server)
            const fileName = file.name;
            const documentUrl = `documents/${fileName}`;
            
            // Create new document entry
            const newDocument = {
                text: text,
                url: documentUrl,
                type: type
            };

            // Add to link map
            if (!this.linkMap.pages[page]) {
                this.linkMap.pages[page] = [];
            }
            this.linkMap.pages[page].push(newDocument);

            // Update lastGenerated timestamp
            this.linkMap.lastGenerated = new Date().toISOString();

            // In a real implementation, you would:
            // 1. Upload the file to the server
            // 2. Update the link-map.json file on the server
            // 3. Optionally refresh the document browser

            this.showStatus(`Document "${text}" has been added to ${this.formatPageName(page)}. File: ${fileName}`, 'success');
            this.resetForm();
            
            // Refresh the document browser if it's currently showing the updated page
            const browser = window.documentBrowser;
            if (browser && browser.currentPage === page) {
                browser.showDocuments(page);
            }

        } catch (error) {
            this.showStatus('Error uploading document: ' + error.message, 'error');
        }
    }

    resetForm() {
        document.getElementById('upload-form').reset();
        this.hideStatus();
    }

    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('upload-status');
        statusEl.textContent = message;
        statusEl.className = `upload-status ${type}`;
    }

    hideStatus() {
        const statusEl = document.getElementById('upload-status');
        statusEl.style.display = 'none';
    }

    formatPageName(pageName) {
        // Convert camelCase or hyphenated to Title Case with spaces
        return pageName
            .replace(/([A-Z])/g, ' $1')
            .replace(/-/g, ' ')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }
} 