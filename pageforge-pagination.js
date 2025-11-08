// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds automatic page breaks and visual page canvas

class PageForgePagination {
    constructor(editor) {
        this.editor = editor;
        this.editorWrapper = document.getElementById('editor-wrapper');
        this.isPaginationEnabled = false;
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
        console.log('PageForgePagination initialized');
        
        // Enable pagination by default
        setTimeout(() => {
            this.enablePagination();
        }, 1000);
    }
    
    setupStyles() {
        // Check if styles already exist
        if (document.getElementById('pagination-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'pagination-styles';
        style.textContent = `
            /* Automatic Page Canvas Styles */
            .page-canvas-enabled #editor {
                position: relative;
                background: linear-gradient(to bottom, 
                    white 0%, white calc(100% - 2px),
                    transparent calc(100% - 2px), transparent 100%);
                background-size: 100% ${this.pageHeight}px;
                background-repeat: repeat-y;
                box-shadow: none !important;
                min-height: auto !important;
                padding: 0 !important;
                margin-bottom: 32px;
            }
            
            .dark .page-canvas-enabled #editor {
                background: linear-gradient(to bottom, 
                    #1f2937 0%, #1f2937 calc(100% - 2px),
                    transparent calc(100% - 2px), transparent 100%);
                background-size: 100% ${this.pageHeight}px;
                background-repeat: repeat-y;
            }
            
            /* Page boundaries */
            .page-boundary {
                position: absolute;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #e5e7eb 20%, 
                    #e5e7eb 80%, 
                    transparent 100%);
                pointer-events: none;
                z-index: 5;
            }
            
            .dark .page-boundary {
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #4b5563 20%, 
                    #4b5563 80%, 
                    transparent 100%);
            }
            
            .page-boundary::after {
                content: "Page End";
                position: absolute;
                top: -20px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                color: #6b7280;
                font-weight: 500;
                border: 1px solid #e5e7eb;
            }
            
            .dark .page-boundary::after {
                background: #374151;
                color: #9ca3af;
                border-color: #4b5563;
            }
            
            /* Page content wrapper */
            .page-content-wrapper {
                position: relative;
                min-height: ${this.pageHeight}px;
                padding: ${this.pageMargin}px;
                margin-bottom: 32px;
                background: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                break-inside: avoid;
            }
            
            .dark .page-content-wrapper {
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            /* Page number */
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
            
            /* Current page highlight */
            .current-page {
                box-shadow: 0 0 0 2px #4f46e5 !important;
            }
            
            /* Manual page break styles */
            .manual-page-break {
                height: 40px;
                margin: 20px 0;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .manual-page-break::before {
                content: "";
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, 
                    transparent 0%, 
                    #dc2626 20%, 
                    #dc2626 80%, 
                    transparent 100%);
            }
            
            .manual-page-break::after {
                content: "Manual Page Break";
                position: absolute;
                background: white;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
                color: #dc2626;
                font-weight: 500;
                border: 1px solid #dc2626;
            }
            
            .dark .manual-page-break::after {
                background: #1f2937;
                color: #f87171;
                border-color: #f87171;
            }
            
            /* Writing area indicator */
            .writing-area {
                position: absolute;
                top: ${this.pageMargin}px;
                bottom: ${this.pageMargin}px;
                left: ${this.pageMargin}px;
                right: ${this.pageMargin}px;
                border: 1px dashed #e5e7eb;
                pointer-events: none;
                z-index: 1;
                opacity: 0.3;
            }
            
            .dark .writing-area {
                border-color: #4b5563;
            }
            
            /* Toolbar button active state */
            .toolbar-btn.active {
                background-color: #dbeafe;
                color: #1d4ed8;
            }
            
            .dark .toolbar-btn.active {
                background-color: #1e3a8a;
                color: #93c5fd;
            }
        `;
        document.head.appendChild(style);
    }
    
    addToolbarButtons() {
        const toolbar = document.querySelector('.flex-shrink-0.flex.items-center.gap-1.px-4.py-2');
        if (!toolbar) {
            console.log('Toolbar not found');
            return;
        }
        
        // Add separator
        const separator = document.createElement('div');
        separator.className = 'h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2';
        toolbar.appendChild(separator);
        
        // Page Canvas Toggle Button
        this.pageCanvasBtn = document.createElement('button');
        this.pageCanvasBtn.className = 'toolbar-btn';
        this.pageCanvasBtn.title = 'Toggle Page Canvas (Auto Pagination)';
        this.pageCanvasBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
        `;
        this.pageCanvasBtn.addEventListener('click', () => this.togglePageCanvas());
        toolbar.appendChild(this.pageCanvasBtn);
        
        // Manual Page Break Button
        const pageBreakBtn = document.createElement('button');
        pageBreakBtn.className = 'toolbar-btn';
        pageBreakBtn.title = 'Insert Manual Page Break (Ctrl+Enter)';
        pageBreakBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
        `;
        pageBreakBtn.addEventListener('click', () => this.insertManualPageBreak());
        toolbar.appendChild(pageBreakBtn);
        
        console.log('Pagination buttons added to toolbar');
    }
    
    setupEventListeners() {
        // Keyboard shortcut for manual page break
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.insertManualPageBreak();
            }
        });
        
        // Update page boundaries on scroll to show current page
        this.editorWrapper.addEventListener('scroll', () => {
            this.updateCurrentPageIndicator();
        });
        
        // Update page boundaries when content changes
        const observer = new MutationObserver(() => {
            if (this.isPaginationEnabled) {
                setTimeout(() => this.updatePageBoundaries(), 100);
            }
        });
        
        observer.observe(this.editor, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('Pagination event listeners set up');
    }
    
    togglePageCanvas() {
        this.isPaginationEnabled = !this.isPaginationEnabled;
        
        if (this.isPaginationEnabled) {
            this.enablePagination();
            this.pageCanvasBtn.classList.add('active');
        } else {
            this.disablePagination();
            this.pageCanvasBtn.classList.remove('active');
        }
        
        console.log('Page canvas toggled:', this.isPaginationEnabled);
    }
    
    enablePagination() {
        this.originalContent = this.editor.innerHTML;
        this.editorWrapper.classList.add('page-canvas-enabled');
        this.updatePageBoundaries();
        console.log('Page canvas enabled');
    }
    
    disablePagination() {
        this.editorWrapper.classList.remove('page-canvas-enabled');
        this.clearPageBoundaries();
        
        // Restore original content structure
        if (this.originalContent) {
            // Remove page content wrappers but keep the content
            const pageWrappers = this.editor.querySelectorAll('.page-content-wrapper');
            pageWrappers.forEach(wrapper => {
                const content = wrapper.innerHTML;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = content;
                wrapper.parentNode.replaceChild(tempDiv, wrapper);
            });
        }
        
        console.log('Page canvas disabled');
    }
    
    updatePageBoundaries() {
        this.clearPageBoundaries();
        
        const editorRect = this.editor.getBoundingClientRect();
        const editorTop = this.editor.offsetTop;
        const contentHeight = this.editor.scrollHeight;
        const numberOfPages = Math.ceil(contentHeight / this.pageHeight);
        
        // Add page boundaries
        for (let i = 1; i < numberOfPages; i++) {
            const boundary = document.createElement('div');
            boundary.className = 'page-boundary';
            boundary.style.top = `${(i * this.pageHeight) - 1}px`;
            this.editor.appendChild(boundary);
        }
        
        // Wrap content in page containers
        this.wrapContentInPages();
        
        // Update current page indicator
        this.updateCurrentPageIndicator();
        
        console.log(`Updated page boundaries: ${numberOfPages} pages`);
    }
    
    wrapContentInPages() {
        const children = Array.from(this.editor.children).filter(child => 
            !child.classList.contains('page-boundary') && 
            !child.classList.contains('page-content-wrapper') &&
            !child.classList.contains('manual-page-break')
        );
        
        let currentPageHeight = 0;
        let currentPageContent = [];
        let pageNumber = 1;
        
        children.forEach((child, index) => {
            const childHeight = this.estimateElementHeight(child);
            
            // Check if this is a manual page break
            if (child.classList.contains('manual-page-break')) {
                // Create page with current content
                if (currentPageContent.length > 0) {
                    this.createPageWrapper(currentPageContent, pageNumber);
                    pageNumber++;
                    currentPageContent = [];
                    currentPageHeight = 0;
                }
                return;
            }
            
            // Check if adding this element would exceed page height
            if (currentPageHeight + childHeight > this.pageHeight - (this.pageMargin * 2) && currentPageContent.length > 0) {
                // Create new page
                this.createPageWrapper(currentPageContent, pageNumber);
                pageNumber++;
                currentPageContent = [child];
                currentPageHeight = childHeight;
            } else {
                // Add to current page
                currentPageContent.push(child);
                currentPageHeight += childHeight;
            }
            
            // If this is the last element, create the final page
            if (index === children.length - 1 && currentPageContent.length > 0) {
                this.createPageWrapper(currentPageContent, pageNumber);
            }
        });
        
        // Remove original children that have been wrapped
        children.forEach(child => {
            if (child.parentNode === this.editor && 
                !child.classList.contains('page-boundary') &&
                !child.classList.contains('manual-page-break')) {
                child.remove();
            }
        });
    }
    
    createPageWrapper(elements, pageNumber) {
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'page-content-wrapper';
        pageWrapper.dataset.pageNumber = pageNumber;
        
        // Add writing area indicator
        const writingArea = document.createElement('div');
        writingArea.className = 'writing-area';
        pageWrapper.appendChild(writingArea);
        
        // Add page number
        const pageNumberEl = document.createElement('div');
        pageNumberEl.className = 'page-number';
        pageNumberEl.textContent = `Page ${pageNumber}`;
        pageWrapper.appendChild(pageNumberEl);
        
        // Add content elements
        elements.forEach(element => {
            pageWrapper.appendChild(element);
        });
        
        this.editor.appendChild(pageWrapper);
    }
    
    estimateElementHeight(element) {
        // Simple height estimation based on element type and content
        const tagName = element.tagName.toLowerCase();
        const textContent = element.textContent || '';
        
        switch(tagName) {
            case 'h1':
                return 80;
            case 'h2':
                return 60;
            case 'h3':
                return 45;
            case 'p':
                const lines = Math.ceil(textContent.length / 80); // ~80 chars per line
                return Math.max(30, lines * 24);
            case 'ul':
            case 'ol':
                const items = element.querySelectorAll('li').length;
                return Math.max(40, items * 30);
            case 'blockquote':
                return 80;
            default:
                return 40;
        }
    }
    
    clearPageBoundaries() {
        const boundaries = this.editor.querySelectorAll('.page-boundary');
        boundaries.forEach(boundary => boundary.remove());
        
        const pageWrappers = this.editor.querySelectorAll('.page-content-wrapper');
        pageWrappers.forEach(wrapper => {
            // Extract content from wrapper before removing it
            const content = Array.from(wrapper.children).filter(child => 
                !child.classList.contains('writing-area') && 
                !child.classList.contains('page-number')
            );
            
            content.forEach(child => {
                this.editor.appendChild(child);
            });
            
            wrapper.remove();
        });
    }
    
    updateCurrentPageIndicator() {
        const pageWrappers = this.editor.querySelectorAll('.page-content-wrapper');
        const editorRect = this.editor.getBoundingClientRect();
        const wrapperRect = this.editorWrapper.getBoundingClientRect();
        
        pageWrappers.forEach(wrapper => {
            wrapper.classList.remove('current-page');
            
            const wrapperRect = wrapper.getBoundingClientRect();
            const wrapperTop = wrapperRect.top - editorRect.top;
            const wrapperBottom = wrapperRect.bottom - editorRect.top;
            
            // Check if this page is currently in view
            if (wrapperTop <= wrapperRect.height / 2 && wrapperBottom >= wrapperRect.height / 2) {
                wrapper.classList.add('current-page');
            }
        });
    }
    
    insertManualPageBreak() {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'manual-page-break';
        pageBreak.contentEditable = 'false';
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        range.insertNode(pageBreak);
        
        // Add space after the page break
        const spacer = document.createElement('p');
        spacer.innerHTML = '<br>';
        pageBreak.parentNode.insertBefore(spacer, pageBreak.nextSibling);
        
        // Move cursor after the page break
        const newRange = document.createRange();
        newRange.setStartAfter(spacer);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        this.editor.focus();
        
        // Update page boundaries
        if (this.isPaginationEnabled) {
            this.updatePageBoundaries();
        }
        
        console.log('Manual page break inserted');
    }
}

// Initialize the module when DOM is loaded and make it globally available
if (typeof window !== 'undefined') {
    window.PageForgePagination = PageForgePagination;
    
    document.addEventListener('DOMContentLoaded', () => {
        const editor = document.getElementById('editor');
        if (editor) {
            window.pageForgePagination = new PageForgePagination(editor);
            console.log('PageForgePagination auto-initialized');
        }
    });
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
