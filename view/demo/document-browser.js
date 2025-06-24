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