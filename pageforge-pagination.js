// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds page breaks, pagination view, and professional writing features

class PageForgePagination {
    constructor(editor, editorWrapper) {
        this.editor = editor;
        this.editorWrapper = editorWrapper;
        this.isPaginationEnabled = false;
        this.pageElements = [];
        this.originalContent = '';
        
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
        
        // Store original content
        this.originalContent = this.editor.innerHTML;
    }
    
    setupStyles() {
        // Check if styles already exist
        if (document.getElementById('pageforge-pagination-styles')) {
            return;
        }
        
        const style = document.createElement('style');
        style.id = 'pageforge-pagination-styles';
        style.textContent = `
            /* Page Break Styles */
            .page-break {
                page-break-after: always;
                break-after: page;
                display: block;
                height: 0;
                margin: 20px 0;
                border-top: 2px dashed #cbd5e1;
                position: relative;
                text-align: center;
                cursor: default;
            }
            
            .page-break::after {
                content: "Page Break";
                position: absolute;
                top: -10px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 0 10px;
                font-size: 12px;
                color: #64748b;
                font-weight: 500;
            }
            
            .dark .page-break {
                border-top-color: #475569;
            }
            
            .dark .page-break::after {
                background: #1e293b;
                color: #94a3b8;
            }
            
            /* Pagination View */
            .pagination-enabled #editor {
                box-shadow: none !important;
                min-height: auto !important;
                margin-bottom: 0 !important;
                background: transparent !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            .pagination-enabled .page-container {
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
            
            .dark .pagination-enabled .page-container {
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .pagination-enabled .page-content {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
                overflow: hidden;
                position: relative;
            }
            
            .page-number {
                position: absolute;
                bottom: 20px;
                right: ${this.pageMargin}px;
                font-size: 12px;
                color: #6b7280;
                font-weight: 500;
            }
            
            .dark .page-number {
                color: #9ca3af;
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
        pageBreakBtn.title = 'Insert Page Break (Ctrl+Enter)';
        pageBreakBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
        `;
        pageBreakBtn.addEventListener('click', () => this.insertPageBreak());
        toolbar.appendChild(pageBreakBtn);
        
        // Pagination Toggle Button
        const paginationBtn = document.createElement('button');
        paginationBtn.className = 'toolbar-btn pagination-toggle-btn';
        paginationBtn.title = 'Toggle Pagination View';
        paginationBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
        `;
        paginationBtn.addEventListener('click', () => this.togglePagination());
        toolbar.appendChild(paginationBtn);
    }
    
    setupEventListeners() {
        // Keyboard shortcut for page break
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.insertPageBreak();
            }
        });
    }
    
    insertPageBreak() {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        pageBreak.contentEditable = 'false';
        pageBreak.dataset.pageBreak = 'true';
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        // Insert the page break
        range.insertNode(pageBreak);
        
        // Add a new paragraph after the page break for continued writing
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';
        pageBreak.parentNode.insertBefore(newParagraph, pageBreak.nextSibling);
        
        // Move cursor to the new paragraph
        const newRange = document.createRange();
        newRange.setStart(newParagraph, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        this.editor.focus();
        
        // Update pagination if enabled
        if (this.isPaginationEnabled) {
            this.updatePagination();
        }
    }
    
    togglePagination() {
        this.isPaginationEnabled = !this.isPaginationEnabled;
        this.editorWrapper.classList.toggle('pagination-enabled', this.isPaginationEnabled);
        
        if (this.isPaginationEnabled) {
            this.enablePagination();
        } else {
            this.disablePagination();
        }
    }
    
    enablePagination() {
        console.log('Enabling pagination...');
        // Store original content if not already stored
        if (!this.originalContent) {
            this.originalContent = this.editor.innerHTML;
        }
        
        // Clear editor and create page view
        this.createPageView();
        this.editor.setAttribute('contenteditable', 'false');
    }
    
    disablePagination() {
        console.log('Disabling pagination...');
        // Restore original content and make editor editable again
        if (this.originalContent) {
            this.editor.innerHTML = this.originalContent;
        }
        this.removePagination();
        this.editor.setAttribute('contenteditable', 'true');
        this.editor.focus();
    }
    
    createPageView() {
        this.removePagination();
        
        const content = this.originalContent;
        const pages = this.splitContentIntoPages(content);
        
        console.log('Creating page view with', pages.length, 'pages');
        
        this.editor.innerHTML = '';
        this.pageElements = [];
        
        pages.forEach((pageContent, index) => {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'page-container';
            
            const pageContentDiv = document.createElement('div');
            pageContentDiv.className = 'page-content';
            pageContentDiv.innerHTML = pageContent;
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = `Page ${index + 1}`;
            
            pageContainer.appendChild(pageContentDiv);
            pageContainer.appendChild(pageNumber);
            this.editor.appendChild(pageContainer);
            
            this.pageElements.push(pageContainer);
        });
    }
    
    splitContentIntoPages(content) {
        console.log('Splitting content into pages...');
        
        // Create a temporary container to parse the HTML
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        
        const pages = [];
        let currentPageContent = [];
        let currentHeight = 0;
        const maxPageHeight = this.pageHeight - (this.pageMargin * 2);
        
        // Get all child nodes
        const nodes = Array.from(tempContainer.childNodes);
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Check if this is a page break
            if (this.isPageBreak(node)) {
                // If we have content in the current page, push it
                if (currentPageContent.length > 0) {
                    pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
                    currentPageContent = [];
                    currentHeight = 0;
                }
                continue; // Skip the page break element itself
            }
            
            // Calculate the height of this node
            const nodeHeight = this.calculateNodeHeight(node);
            
            // Check if adding this node would exceed the page height
            if (currentHeight + nodeHeight > maxPageHeight && currentPageContent.length > 0) {
                // Start a new page
                pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
                currentPageContent = [node];
                currentHeight = nodeHeight;
            } else {
                // Add to current page
                currentPageContent.push(node);
                currentHeight += nodeHeight;
            }
        }
        
        // Add the last page if it has content
        if (currentPageContent.length > 0) {
            pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
        }
        
        // If no pages were created (empty content), create one empty page
        if (pages.length === 0) {
            pages.push('<p></p>');
        }
        
        console.log('Created', pages.length, 'pages');
        return pages;
    }
    
    isPageBreak(node) {
        return node.nodeType === Node.ELEMENT_NODE && 
               (node.classList?.contains('page-break') || node.dataset?.pageBreak === 'true');
    }
    
    calculateNodeHeight(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            // For text nodes, estimate height based on character count
            const text = node.textContent || '';
            const lines = Math.ceil(text.length / 80); // Rough estimate: 80 chars per line
            const lineHeight = 20; // Approximate line height in pixels
            return lines * lineHeight;
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            // Create a temporary element to measure height
            const temp = document.createElement('div');
            temp.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                width: ${this.pageWidth - (this.pageMargin * 2)}px;
                padding: ${this.pageMargin}px;
                font-size: 14px;
                line-height: ${this.lineHeight};
                visibility: hidden;
            `;
            temp.innerHTML = node.outerHTML;
            document.body.appendChild(temp);
            const height = temp.offsetHeight;
            document.body.removeChild(temp);
            return height;
        }
        
        return 0;
    }
    
    removePagination() {
        if (this.pageElements.length > 0) {
            this.pageElements.forEach(page => {
                if (page.parentNode) {
                    page.parentNode.removeChild(page);
                }
            });
            this.pageElements = [];
        }
    }
    
    // Method to get content with proper page breaks for printing
    getContentForPrint() {
        let content = this.originalContent || this.editor.innerHTML;
        
        // Convert page breaks to CSS page breaks for print
        content = content.replace(/<div class="page-break"[^>]*><\/div>/g, '<div style="page-break-after: always;"></div>');
        
        return content;
    }
    
    updatePagination() {
        if (this.isPaginationEnabled) {
            this.originalContent = this.editor.innerHTML;
            this.createPageView();
        }
    }
}

// Initialize the module with proper error handling and retry logic
function initializePageForgePagination(retryCount = 0) {
    const maxRetries = 10;
    
    try {
        const editor = document.getElementById('editor');
        const editorWrapper = document.getElementById('editor-wrapper');
        
        if (editor && editorWrapper) {
            console.log('PageForge Pagination: Elements found, initializing...');
            window.pageForgePagination = new PageForgePagination(editor, editorWrapper);
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

// Wait for DOM to be ready with multiple fallbacks
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializePageForgePagination, 100);
    });
} else {
    setTimeout(initializePageForgePagination, 100);
}

// Additional safety net - wait for window load
window.addEventListener('load', () => {
    if (!window.pageForgePagination) {
        console.log('PageForge Pagination: Window loaded, attempting initialization...');
        setTimeout(initializePageForgePagination, 500);
    }
});

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
