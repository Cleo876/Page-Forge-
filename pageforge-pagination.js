// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds automatic page breaks and pagination as the default view

class PageForgePagination {
    constructor(editor, editorWrapper) {
        this.editor = editor;
        this.editorWrapper = editorWrapper;
        this.pageElements = [];
        this.originalContent = '';
        
        // A4 dimensions in pixels at 96 DPI
        this.pageWidth = 816;
        this.pageHeight = 1122;
        this.pageMargin = 96;
        
        this.init();
    }
    
    init() {
        this.setupStyles();
        this.addToolbarButtons();
        this.setupEventListeners();
        this.enablePagination(); // Enable pagination by default
    }
    
    setupStyles() {
        const style = document.createElement('style');
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
            
            /* Pagination View - ALWAYS ENABLED */
            #editor {
                box-shadow: none !important;
                min-height: auto !important;
                margin-bottom: 0 !important;
                background: transparent !important;
                padding: 0 !important;
                width: 100% !important;
            }
            
            .page-container {
                background: white;
                width: ${this.pageWidth}px;
                min-height: ${this.pageHeight}px;
                margin: 0 auto 32px auto;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                position: relative;
                page-break-after: always;
                break-after: page;
            }
            
            .dark .page-container {
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .page-content {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
                outline: none;
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
            
            /* Auto page break indicator */
            .auto-page-break {
                border-top: 1px dotted #e5e7eb;
                margin: 10px 0;
                position: relative;
            }
            
            .auto-page-break::after {
                content: "Auto Page Break";
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 0 8px;
                font-size: 10px;
                color: #9ca3af;
            }
            
            .dark .auto-page-break {
                border-top-color: #4b5563;
            }
            
            .dark .auto-page-break::after {
                background: #1f2937;
                color: #6b7280;
            }
        `;
        document.head.appendChild(style);
    }
    
    addToolbarButtons() {
        const toolbar = document.querySelector('.flex-shrink-0.flex.items-center.gap-1.px-4.py-2');
        if (!toolbar) return;
        
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2';
        toolbar.appendChild(separator);
        
        // Page Break Button (keep this for manual breaks)
        const pageBreakBtn = document.createElement('button');
        pageBreakBtn.className = 'toolbar-btn';
        pageBreakBtn.title = 'Insert Page Break (Ctrl+Enter)';
        pageBreakBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
        `;
        pageBreakBtn.addEventListener('click', () => this.insertPageBreak());
        toolbar.appendChild(pageBreakBtn);
        
        // Remove the pagination toggle button since it's always enabled now
    }
    
    setupEventListeners() {
        // Keyboard shortcut for page break
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.insertPageBreak();
            }
        });
        
        // Monitor content changes for automatic pagination
        const observer = new MutationObserver(() => {
            this.handleContentChanges();
        });
        
        observer.observe(this.editor, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
    
    enablePagination() {
        // Store original content
        this.originalContent = this.editor.innerHTML;
        
        // Convert to paged view immediately
        this.convertToPagedView();
        
        // Set up page containers as editable
        this.makePagesEditable();
    }
    
    convertToPagedView() {
        const content = this.editor.innerHTML;
        const pages = this.splitContentIntoPages(content);
        
        this.editor.innerHTML = '';
        this.pageElements = [];
        
        pages.forEach((pageContent, index) => {
            const pageContainer = this.createPageContainer(pageContent, index + 1);
            this.editor.appendChild(pageContainer);
            this.pageElements.push(pageContainer);
        });
    }
    
    createPageContainer(content, pageNumber) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';
        
        const pageContentDiv = document.createElement('div');
        pageContentDiv.className = 'page-content';
        pageContentDiv.contentEditable = 'true'; // Make it editable!
        pageContentDiv.innerHTML = content;
        
        const pageNumberDiv = document.createElement('div');
        pageNumberDiv.className = 'page-number';
        pageNumberDiv.textContent = `Page ${pageNumber}`;
        
        pageContainer.appendChild(pageContentDiv);
        pageContainer.appendChild(pageNumberDiv);
        
        return pageContainer;
    }
    
    makePagesEditable() {
        // Ensure all page content areas are editable
        this.pageElements.forEach(page => {
            const contentDiv = page.querySelector('.page-content');
            if (contentDiv) {
                contentDiv.contentEditable = 'true';
                
                // Add input listener to handle auto-pagination
                contentDiv.addEventListener('input', () => {
                    this.handlePageContentChange(contentDiv);
                });
            }
        });
    }
    
    handlePageContentChange(contentDiv) {
        // Check if content overflows and needs a new page
        if (this.isContentOverflowing(contentDiv)) {
            this.splitOverflowContent(contentDiv);
        }
        this.updatePageNumbers();
    }
    
    handleContentChanges() {
        // Global content change handler
        this.pageElements.forEach((page, index) => {
            const contentDiv = page.querySelector('.page-content');
            if (contentDiv && this.isContentOverflowing(contentDiv)) {
                this.splitOverflowContent(contentDiv);
            }
        });
        this.updatePageNumbers();
    }
    
    isContentOverflowing(contentDiv) {
        const contentHeight = contentDiv.scrollHeight;
        const maxHeight = this.pageHeight - (this.pageMargin * 2);
        return contentHeight > maxHeight;
    }
    
    splitOverflowContent(overflowingContentDiv) {
        const pageContainer = overflowingContentDiv.closest('.page-container');
        const pageIndex = this.pageElements.indexOf(pageContainer);
        
        if (pageIndex === -1) return;
        
        const contentNodes = Array.from(overflowingContentDiv.childNodes);
        let currentHeight = 0;
        const maxHeight = this.pageHeight - (this.pageMargin * 2);
        let splitIndex = -1;
        
        // Find where to split the content
        for (let i = 0; i < contentNodes.length; i++) {
            const node = contentNodes[i];
            const nodeHeight = this.calculateNodeHeight(node);
            
            if (currentHeight + nodeHeight > maxHeight && i > 0) {
                splitIndex = i;
                break;
            }
            currentHeight += nodeHeight;
        }
        
        if (splitIndex > 0) {
            // Create new page with overflow content
            const overflowNodes = contentNodes.slice(splitIndex);
            const newPageContent = overflowNodes.map(node => node.outerHTML || node.textContent).join('');
            
            // Remove overflow content from current page
            for (let i = splitIndex; i < contentNodes.length; i++) {
                if (contentNodes[i].parentNode) {
                    contentNodes[i].parentNode.removeChild(contentNodes[i]);
                }
            }
            
            // Insert new page after current page
            const newPageContainer = this.createPageContainer(newPageContent, pageIndex + 2);
            pageContainer.parentNode.insertBefore(newPageContainer, pageContainer.nextSibling);
            this.pageElements.splice(pageIndex + 1, 0, newPageContainer);
        }
    }
    
    calculateNodeHeight(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            const lines = Math.ceil(text.length / 80); // Rough estimate
            return lines * 20; // Approximate line height
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const temp = document.createElement('div');
            temp.style.cssText = `
                position: absolute;
                left: -9999px;
                top: -9999px;
                width: ${this.pageWidth - (this.pageMargin * 2)}px;
                padding: ${this.pageMargin}px;
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
    
    insertPageBreak() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const currentPageContent = range.startContainer.closest('.page-content');
        
        if (!currentPageContent) return;
        
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        pageBreak.contentEditable = 'false';
        
        // Insert the page break
        range.insertNode(pageBreak);
        
        // Add a paragraph after the page break for continued writing
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';
        pageBreak.parentNode.insertBefore(newParagraph, pageBreak.nextSibling);
        
        // Move cursor to the new paragraph
        const newRange = document.createRange();
        newRange.setStart(newParagraph, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Force pagination update
        this.handleContentChanges();
    }
    
    splitContentIntoPages(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        const pages = [];
        let currentPageContent = [];
        let currentHeight = 0;
        const maxHeight = this.pageHeight - (this.pageMargin * 2);
        
        const nodes = Array.from(tempDiv.childNodes);
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            
            // Check if this is a page break
            if (node.nodeType === Node.ELEMENT_NODE && 
                (node.classList?.contains('page-break') || node.dataset?.pageBreak === 'true')) {
                // Push current page and start new one
                if (currentPageContent.length > 0) {
                    pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
                    currentPageContent = [];
                    currentHeight = 0;
                }
                continue;
            }
            
            const nodeHeight = this.calculateNodeHeight(node);
            
            // Check if adding this node would exceed page height
            if (currentHeight + nodeHeight > maxHeight && currentPageContent.length > 0) {
                pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
                currentPageContent = [node];
                currentHeight = nodeHeight;
            } else {
                currentPageContent.push(node);
                currentHeight += nodeHeight;
            }
        }
        
        // Add the last page
        if (currentPageContent.length > 0) {
            pages.push(currentPageContent.map(n => n.outerHTML || n.textContent).join(''));
        }
        
        return pages.length > 0 ? pages : [content];
    }
    
    updatePageNumbers() {
        this.pageElements.forEach((page, index) => {
            const pageNumber = page.querySelector('.page-number');
            if (pageNumber) {
                pageNumber.textContent = `Page ${index + 1}`;
            }
        });
    }
    
    // Export for printing with page breaks
    getContentForPrint() {
        let allContent = '';
        
        this.pageElements.forEach((page, index) => {
            const pageContent = page.querySelector('.page-content');
            if (pageContent) {
                allContent += pageContent.innerHTML;
                
                // Add page break if not the last page
                if (index < this.pageElements.length - 1) {
                    allContent += '<div style="page-break-after: always;"></div>';
                }
            }
        });
        
        return allContent;
    }
    
    // Enhanced word count with detailed statistics
    getDetailedWordCount() {
        let allText = '';
        
        this.pageElements.forEach(page => {
            const pageContent = page.querySelector('.page-content');
            if (pageContent) {
                allText += pageContent.innerText || '';
            }
        });
        
        const words = allText.trim().split(/\s+/).filter(Boolean);
        const characters = allText.length;
        const charactersNoSpaces = allText.replace(/\s/g, '').length;
        
        return {
            words: words.length,
            characters: characters,
            charactersNoSpaces: charactersNoSpaces,
            readingTime: Math.ceil(words.length / 200)
        };
    }
}

// Initialize the module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const editorWrapper = document.getElementById('editor-wrapper');
    
    if (editor && editorWrapper) {
        // Small delay to ensure everything is loaded
        setTimeout(() => {
            window.pageForgePagination = new PageForgePagination(editor, editorWrapper);
        }, 100);
    }
});

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
