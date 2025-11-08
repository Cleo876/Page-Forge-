// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds automatic page breaks and pagination as the default view

class PageForgePagination {
    constructor(editor, editorWrapper) {
        this.editor = editor;
        this.editorWrapper = editorWrapper;
        this.pageElements = [];
        this.currentPage = 1;
        
        // A4 dimensions in pixels at 96 DPI
        this.pageWidth = 816;
        this.pageHeight = 1122;
        this.pageMargin = 96;
        this.lineHeight = 1.625;
        
        this.init();
    }
    
    init() {
        console.log('PageForge Pagination initializing...');
        this.setupStyles();
        this.addToolbarButtons();
        this.setupEventListeners();
        this.enablePagination();
    }
    
    setupStyles() {
        // Check if styles already exist
        if (document.getElementById('pageforge-pagination-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'pageforge-pagination-styles';
        style.textContent = `
            /* Page Container Styles */
            .page-container {
                background: white;
                width: ${this.pageWidth}px;
                min-height: ${this.pageHeight}px;
                margin: 0 auto 32px auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                position: relative;
                page-break-after: always;
                break-after: page;
                overflow: hidden;
            }
            
            .dark .page-container {
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .page-content {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
                position: relative;
                outline: none;
            }
            
            .page-number {
                position: absolute;
                bottom: 20px;
                right: ${this.pageMargin}px;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
                pointer-events: none;
            }
            
            .dark .page-number {
                color: #9ca3af;
            }
            
            /* Auto Page Break Indicator */
            .auto-page-break {
                height: 1px;
                background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
                margin: 10px 0;
                position: relative;
            }
            
            .dark .auto-page-break {
                background: linear-gradient(90deg, transparent 0%, #4b5563 50%, transparent 100%);
            }
            
            /* Manual Page Break Styles */
            .manual-page-break {
                height: 2px;
                background: linear-gradient(90deg, transparent 0%, #cbd5e1 20%, #cbd5e1 80%, transparent 100%);
                margin: 20px 0;
                position: relative;
                cursor: pointer;
            }
            
            .manual-page-break::before {
                content: "PAGE BREAK";
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 2px 8px;
                font-size: 10px;
                color: #64748b;
                font-weight: 500;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
            }
            
            .dark .manual-page-break {
                background: linear-gradient(90deg, transparent 0%, #475569 20%, #475569 80%, transparent 100%);
            }
            
            .dark .manual-page-break::before {
                background: #1f2937;
                color: #94a3b8;
                border-color: #374151;
            }
            
            /* Editor base styles */
            #editor {
                background: transparent !important;
                box-shadow: none !important;
                min-height: auto !important;
                padding: 0 !important;
                width: 100% !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    addToolbarButtons() {
        const toolbar = document.querySelector('.flex-shrink-0.flex.items-center.gap-1.px-4.py-2');
        if (!toolbar) {
            console.warn('Toolbar not found, retrying...');
            setTimeout(() => this.addToolbarButtons(), 100);
            return;
        }
        
        // Check if buttons already exist
        if (toolbar.querySelector('.page-break-btn')) {
            return;
        }
        
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2';
        toolbar.appendChild(separator);
        
        // Page Break Button
        const pageBreakBtn = document.createElement('button');
        pageBreakBtn.className = 'toolbar-btn page-break-btn';
        pageBreakBtn.title = 'Insert Manual Page Break (Ctrl+Enter)';
        pageBreakBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
        `;
        pageBreakBtn.addEventListener('click', () => this.insertManualPageBreak());
        toolbar.appendChild(pageBreakBtn);
    }
    
    setupEventListeners() {
        // Keyboard shortcut for manual page break
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.insertManualPageBreak();
            }
        });
        
        // Monitor content changes for automatic pagination
        const observer = new MutationObserver(() => {
            this.updatePagination();
        });
        
        observer.observe(this.editor, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    enablePagination() {
        console.log('Enabling pagination as default view...');
        this.convertToPagedView();
    }
    
    convertToPagedView() {
        // Clear existing content
        this.editor.innerHTML = '';
        
        // Create initial page
        this.createNewPage(1);
        
        // Move existing content to the first page
        if (this.originalContent) {
            this.pageElements[0].querySelector('.page-content').innerHTML = this.originalContent;
        }
        
        // Update pagination
        this.updatePagination();
    }
    
    createNewPage(pageNumber) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        pageContainer.dataset.pageNumber = pageNumber;
        
        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.contentEditable = 'true';
        pageContent.spellcheck = 'true';
        
        const pageNumberElement = document.createElement('div');
        pageNumberElement.className = 'page-number';
        pageNumberElement.textContent = `Page ${pageNumber}`;
        
        pageContainer.appendChild(pageContent);
        pageContainer.appendChild(pageNumberElement);
        this.editor.appendChild(pageContainer);
        
        this.pageElements.push(pageContainer);
        
        // Set up event listeners for the new page
        this.setupPageEventListeners(pageContent);
        
        return pageContent;
    }
    
    setupPageEventListeners(pageContent) {
        // Handle input events
        pageContent.addEventListener('input', () => {
            this.handlePageContentChange(pageContent);
        });
        
        // Handle paste events
        pageContent.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
            this.handlePageContentChange(pageContent);
        });
    }
    
    handlePageContentChange(pageContent) {
        const pageContainer = pageContent.closest('.page-container');
        const pageNumber = parseInt(pageContainer.dataset.pageNumber);
        
        // Check if content exceeds page height
        if (this.isContentOverflowing(pageContent)) {
            this.splitPageContent(pageNumber);
        }
        
        this.updatePageNumbers();
    }
    
    isContentOverflowing(pageContent) {
        const contentHeight = pageContent.scrollHeight;
        const maxHeight = this.pageHeight - (this.pageMargin * 2);
        return contentHeight > maxHeight;
    }
    
    splitPageContent(pageNumber) {
        const currentPage = this.pageElements[pageNumber - 1];
        const currentContent = currentPage.querySelector('.page-content');
        const contentNodes = Array.from(currentContent.childNodes);
        
        let currentHeight = 0;
        const maxHeight = this.pageHeight - (this.pageMargin * 2);
        let splitIndex = -1;
        
        // Find where to split the content
        for (let i = 0; i < contentNodes.length; i++) {
            const node = contentNodes[i];
            const nodeHeight = this.calculateNodeHeight(node);
            
            if (currentHeight + nodeHeight > maxHeight) {
                splitIndex = i;
                break;
            }
            currentHeight += nodeHeight;
        }
        
        if (splitIndex > 0) {
            // Create new page
            const newPageContent = this.createNewPage(pageNumber + 1);
            
            // Move overflow content to new page
            const overflowNodes = contentNodes.slice(splitIndex);
            overflowNodes.forEach(node => {
                newPageContent.appendChild(node);
            });
            
            // Update all page numbers
            this.updatePageNumbers();
        }
    }
    
    calculateNodeHeight(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            const lines = Math.ceil(text.length / 80);
            return lines * 20; // Approximate line height
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const temp = document.createElement('div');
            temp.style.cssText = `
                position: absolute;
                left: -9999px;
                width: ${this.pageWidth - (this.pageMargin * 2)}px;
                padding: ${this.pageMargin}px;
                visibility: hidden;
            `;
            temp.appendChild(node.cloneNode(true));
            document.body.appendChild(temp);
            const height = temp.offsetHeight;
            document.body.removeChild(temp);
            return height;
        }
        
        return 0;
    }
    
    insertManualPageBreak() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const currentPageContent = range.startContainer.closest('.page-content');
        
        if (!currentPageContent) return;
        
        // Create manual page break
        const pageBreak = document.createElement('div');
        pageBreak.className = 'manual-page-break';
        pageBreak.contentEditable = 'false';
        
        // Insert the page break
        range.insertNode(pageBreak);
        
        // Add space after page break
        const space = document.createElement('p');
        space.innerHTML = '<br>';
        pageBreak.parentNode.insertBefore(space, pageBreak.nextSibling);
        
        // Move cursor after the page break
        const newRange = document.createRange();
        newRange.setStart(space, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Force pagination update
        this.updatePagination();
    }
    
    updatePagination() {
        // Check each page for overflow and split if necessary
        this.pageElements.forEach((page, index) => {
            const pageContent = page.querySelector('.page-content');
            if (this.isContentOverflowing(pageContent)) {
                this.splitPageContent(index + 1);
            }
        });
        
        this.updatePageNumbers();
    }
    
    updatePageNumbers() {
        this.pageElements.forEach((page, index) => {
            const pageNumberElement = page.querySelector('.page-number');
            pageNumberElement.textContent = `Page ${index + 1}`;
            page.dataset.pageNumber = index + 1;
        });
    }
    
    removePagination() {
        if (this.pageElements.length > 0) {
            // Store content before removing pages
            let allContent = '';
            this.pageElements.forEach(page => {
                const pageContent = page.querySelector('.page-content');
                allContent += pageContent.innerHTML;
            });
            
            // Remove all pages
            this.pageElements.forEach(page => {
                if (page.parentNode) {
                    page.parentNode.removeChild(page);
                }
            });
            this.pageElements = [];
            
            // Restore as single editable div
            this.editor.innerHTML = allContent;
            this.editor.contentEditable = 'true';
        }
    }
    
    // Method to get content with proper page breaks for printing
    getContentForPrint() {
        let allContent = '';
        
        this.pageElements.forEach((page, index) => {
            const pageContent = page.querySelector('.page-content').innerHTML;
            
            // Add page content
            allContent += pageContent;
            
            // Add page break if not the last page
            if (index < this.pageElements.length - 1) {
                allContent += '<div style="page-break-after: always;"></div>';
            }
        });
        
        return allContent;
    }
}

// Initialize the module
function initializePageForgePagination(retryCount = 0) {
    const maxRetries = 10;
    
    try {
        const editor = document.getElementById('editor');
        const editorWrapper = document.getElementById('editor-wrapper');
        
        if (editor && editorWrapper) {
            console.log('PageForge Pagination: Elements found, initializing...');
            
            // Store original content before enabling pagination
            const originalContent = editor.innerHTML;
            
            window.pageForgePagination = new PageForgePagination(editor, editorWrapper);
            window.pageForgePagination.originalContent = originalContent;
            
            console.log('PageForge Pagination initialized successfully!');
        } else {
            if (retryCount < maxRetries) {
                console.log(`PageForge Pagination: Elements not found, retrying in ${100 * (retryCount + 1)}ms... (${retryCount + 1}/${maxRetries})`);
                setTimeout(() => initializePageForgePagination(retryCount + 1), 100 * (retryCount + 1));
            } else {
                console.error('PageForge Pagination: Failed to initialize after maximum retries');
            }
        }
    } catch (error) {
        console.error('PageForge Pagination: Error during initialization:', error);
        if (retryCount < maxRetries) {
            setTimeout(() => initializePageForgePagination(retryCount + 1), 100 * (retryCount + 1));
        }
    }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializePageForgePagination, 100);
    });
} else {
    setTimeout(initializePageForgePagination, 100);
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
