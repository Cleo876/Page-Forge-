// PageForge Automatic Pagination Module
// Filename: pageforge-pagination.js
// Purpose: Adds automatic page creation with digital paper appearance

class PageForgePagination {
    constructor(editor) {
        this.editor = editor;
        this.editorWrapper = document.getElementById('editor-wrapper');
        this.isPaginationEnabled = true; // Enabled by default
        this.pageElements = [];
        
        // A4 dimensions in pixels at 96 DPI
        this.pageWidth = 816;
        this.pageHeight = 1122;
        this.pageMargin = 96;
        
        // Lines per page estimation (approx 55 lines for A4 with 14px font)
        this.linesPerPage = 55;
        this.currentLines = 0;
        
        this.init();
    }
    
    init() {
        this.setupStyles();
        this.setupEventListeners();
        this.enablePagination();
        console.log('Auto Pagination initialized');
    }
    
    setupStyles() {
        if (document.getElementById('auto-pagination-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'auto-pagination-styles';
        style.textContent = `
            /* Auto Page Canvas - Always Enabled */
            .auto-pagination-enabled #editor {
                background: transparent !important;
                box-shadow: none !important;
                min-height: auto !important;
                padding: 0 !important;
                width: 100% !important;
                display: flex;
                flex-direction: column;
                gap: 32px;
            }
            
            /* Digital Paper Page */
            .digital-page {
                width: ${this.pageWidth}px;
                min-height: ${this.pageHeight}px;
                background: white;
                margin: 0 auto;
                box-shadow: 
                    0 0 0 1px rgba(0,0,0,0.1),
                    0 4px 12px rgba(0, 0, 0, 0.08),
                    0 2px 4px rgba(0, 0, 0, 0.04);
                position: relative;
                border-radius: 2px;
                overflow: hidden;
                transition: box-shadow 0.2s ease;
            }
            
            .digital-page:hover {
                box-shadow: 
                    0 0 0 1px rgba(59, 130, 246, 0.3),
                    0 8px 24px rgba(0, 0, 0, 0.12),
                    0 4px 8px rgba(0, 0, 0, 0.06);
            }
            
            .dark .digital-page {
                background: #1f2937;
                box-shadow: 
                    0 0 0 1px rgba(255,255,255,0.1),
                    0 4px 12px rgba(0, 0, 0, 0.3),
                    0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            .dark .digital-page:hover {
                box-shadow: 
                    0 0 0 1px rgba(96, 165, 250, 0.4),
                    0 8px 24px rgba(0, 0, 0, 0.4),
                    0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            /* Page Content Area */
            .page-content-area {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
                position: relative;
            }
            
            /* Page Number */
            .page-number {
                position: absolute;
                bottom: 20px;
                right: ${this.pageMargin}px;
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
            }
            
            .dark .page-number {
                color: #9ca3af;
            }
            
            /* Writing Guidelines (Subtle) */
            .writing-guidelines {
                position: absolute;
                top: ${this.pageMargin}px;
                bottom: ${this.pageMargin}px;
                left: ${this.pageMargin}px;
                right: ${this.pageMargin}px;
                pointer-events: none;
                z-index: 1;
                opacity: 0.03;
                background-image: 
                    repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 23px,
                        #4b5563 23px,
                        #4b5563 24px
                    );
            }
            
            .dark .writing-guidelines {
                background-image: 
                    repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 23px,
                        #e5e7eb 23px,
                        #e5e7eb 24px
                    );
            }
            
            /* Current Page Highlight */
            .digital-page.current-page {
                box-shadow: 
                    0 0 0 2px #4f46e5,
                    0 8px 24px rgba(0, 0, 0, 0.12) !important;
            }
            
            .dark .digital-page.current-page {
                box-shadow: 
                    0 0 0 2px #6366f1,
                    0 8px 24px rgba(0, 0, 0, 0.4) !important;
            }
            
            /* Page Header (Optional) */
            .page-header {
                position: absolute;
                top: 20px;
                left: ${this.pageMargin}px;
                right: ${this.pageMargin}px;
                height: 1px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #e5e7eb 20%, 
                    #e5e7eb 80%, 
                    transparent 100%);
            }
            
            .dark .page-header {
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #4b5563 20%, 
                    #4b5563 80%, 
                    transparent 100%);
            }
            
            /* Auto-expand last page */
            .digital-page:last-child {
                min-height: ${this.pageHeight}px;
            }
            
            /* Ensure content is visible and editable */
            .page-content-area > * {
                position: relative;
                z-index: 2;
            }
            
            /* Smooth transitions */
            .digital-page {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        // Monitor content changes to automatically manage pages
        const observer = new MutationObserver(() => {
            if (this.isPaginationEnabled) {
                setTimeout(() => this.organizeContentIntoPages(), 50);
            }
        });
        
        observer.observe(this.editor, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        // Update current page on scroll
        this.editorWrapper.addEventListener('scroll', () => {
            this.updateCurrentPageIndicator();
        });
        
        console.log('Auto pagination listeners setup');
    }
    
    enablePagination() {
        this.editorWrapper.classList.add('auto-pagination-enabled');
        this.organizeContentIntoPages();
        console.log('Auto pagination enabled');
    }
    
    disablePagination() {
        this.editorWrapper.classList.remove('auto-pagination-enabled');
        this.removePageWrappers();
        console.log('Auto pagination disabled');
    }
    
    organizeContentIntoPages() {
        // Get all direct children of editor (excluding page wrappers)
        const contentElements = Array.from(this.editor.children).filter(
            child => !child.classList.contains('digital-page')
        );
        
        if (contentElements.length === 0) {
            this.ensureAtLeastOnePage();
            return;
        }
        
        this.removePageWrappers();
        this.distributeContentToPages(contentElements);
        this.updateCurrentPageIndicator();
    }
    
    distributeContentToPages(elements) {
        let currentPage = this.createNewPage(1);
        let currentPageHeight = 0;
        let pageNumber = 1;
        
        elements.forEach((element, index) => {
            const elementHeight = this.calculateElementHeight(element);
            
            // If adding this element would exceed page height, create new page
            if (currentPageHeight + elementHeight > this.getAvailablePageHeight() && currentPageHeight > 0) {
                pageNumber++;
                currentPage = this.createNewPage(pageNumber);
                currentPageHeight = 0;
            }
            
            // Add element to current page
            currentPage.querySelector('.page-content-area').appendChild(element);
            currentPageHeight += elementHeight;
            
            // Ensure we have at least one element per page
            if (currentPageHeight === 0 && index === elements.length - 1) {
                const emptyParagraph = document.createElement('p');
                emptyParagraph.innerHTML = '&nbsp;';
                currentPage.querySelector('.page-content-area').appendChild(emptyParagraph);
            }
        });
        
        console.log(`Organized content into ${pageNumber} pages`);
    }
    
    createNewPage(pageNumber) {
        const page = document.createElement('div');
        page.className = 'digital-page';
        page.dataset.pageNumber = pageNumber;
        
        page.innerHTML = `
            <div class="writing-guidelines"></div>
            <div class="page-header"></div>
            <div class="page-content-area" contenteditable="true"></div>
            <div class="page-number">Page ${pageNumber}</div>
        `;
        
        this.editor.appendChild(page);
        this.pageElements.push(page);
        
        return page;
    }
    
    calculateElementHeight(element) {
        // Simple height estimation based on content
        const tag = element.tagName.toLowerCase();
        const text = element.textContent || '';
        const children = element.children.length;
        
        let baseHeight = 0;
        
        switch(tag) {
            case 'h1':
                baseHeight = 60;
                break;
            case 'h2':
                baseHeight = 45;
                break;
            case 'h3':
                baseHeight = 35;
                break;
            case 'p':
                baseHeight = Math.max(24, Math.ceil(text.length / 80) * 24);
                break;
            case 'ul':
            case 'ol':
                baseHeight = Math.max(30, children * 28);
                break;
            case 'blockquote':
                baseHeight = 60;
                break;
            default:
                baseHeight = element.offsetHeight || 40;
        }
        
        // Add margin compensation
        return baseHeight + 16;
    }
    
    getAvailablePageHeight() {
        return this.pageHeight - (this.pageMargin * 2) - 40; // 40px for page number area
    }
    
    ensureAtLeastOnePage() {
        if (this.pageElements.length === 0) {
            const page = this.createNewPage(1);
            const emptyParagraph = document.createElement('p');
            emptyParagraph.innerHTML = '&nbsp;';
            page.querySelector('.page-content-area').appendChild(emptyParagraph);
        }
    }
    
    removePageWrappers() {
        this.pageElements.forEach(page => page.remove());
        this.pageElements = [];
        
        // Extract all content from pages and put back in editor
        const pages = this.editor.querySelectorAll('.digital-page');
        pages.forEach(page => {
            const contentArea = page.querySelector('.page-content-area');
            if (contentArea) {
                const children = Array.from(contentArea.children);
                children.forEach(child => {
                    this.editor.appendChild(child);
                });
            }
            page.remove();
        });
    }
    
    updateCurrentPageIndicator() {
        const pages = this.editor.querySelectorAll('.digital-page');
        const wrapperRect = this.editorWrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.top + (wrapperRect.height / 2);
        
        pages.forEach(page => {
            page.classList.remove('current-page');
            
            const pageRect = page.getBoundingClientRect();
            const pageCenter = pageRect.top + (pageRect.height / 2);
            
            // Check if page center is within viewport center ± 25%
            if (Math.abs(pageCenter - wrapperCenter) < wrapperRect.height * 0.25) {
                page.classList.add('current-page');
            }
        });
    }
    
    // Public method to toggle pagination (if needed)
    togglePagination() {
        this.isPaginationEnabled = !this.isPaginationEnabled;
        
        if (this.isPaginationEnabled) {
            this.enablePagination();
        } else {
            this.disablePagination();
        }
        
        return this.isPaginationEnabled;
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.PageForgePagination = PageForgePagination;
    
    document.addEventListener('DOMContentLoaded', () => {
        const editor = document.getElementById('editor');
        if (editor) {
            // Enable auto-pagination by default
            window.pageForgePagination = new PageForgePagination(editor);
            console.log('Auto Pagination ready - pages created automatically');
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
