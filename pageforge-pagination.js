// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds page breaks, pagination view, and professional writing features

class PageForgePagination {
    constructor(editor, editorWrapper) {
        this.editor = editor;
        this.editorWrapper = editorWrapper;
        this.isPaginationEnabled = false;
        this.pageElements = [];
        this.pageBreaks = new Set();
        
        // A4 dimensions in pixels at 96 DPI
        this.pageWidth = 816;
        this.pageHeight = 1122;
        this.pageMargin = 96;
        this.lineHeight = 1.625; // Match your editor's line-height
        
        this.init();
    }
    
    init() {
        this.setupStyles();
        this.addToolbarButtons();
        this.setupEventListeners();
        this.setupResizeObserver();
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
                box-shadow: none;
                min-height: auto;
                margin-bottom: 0;
                background: transparent !important;
                padding: 0;
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
                overflow: hidden;
            }
            
            .dark .page-container {
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .page-content {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
                height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
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
            
            /* Digital Page Canvas */
            .digital-page {
                background: white;
                min-height: ${this.pageHeight}px;
                margin-bottom: 32px;
                position: relative;
            }
            
            .dark .digital-page {
                background: #1f2937;
            }
            
            .page-canvas {
                padding: ${this.pageMargin}px;
                min-height: calc(${this.pageHeight}px - ${this.pageMargin * 2}px);
            }
            
            /* Enhanced Writing Features */
            .word-count-popup {
                position: absolute;
                background: #1f2937;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                z-index: 1000;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                pointer-events: none;
                transform: translateY(-100%);
                margin-top: -8px;
            }
            
            .word-count-popup::after {
                content: '';
                position: absolute;
                bottom: -4px;
                left: 50%;
                transform: translateX(-50%);
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 4px solid #1f2937;
            }
            
            /* Focus Mode */
            .focus-mode {
                background: #fef3c7 !important;
                transition: background-color 0.3s ease;
            }
            
            .dark .focus-mode {
                background: #78350f !important;
            }
            
            /* Reading Mode */
            .reading-mode {
                max-width: 800px;
                margin: 0 auto;
                line-height: 1.8;
                font-size: 18px;
            }
            
            .reading-mode h1 {
                font-size: 2.5rem;
                margin-bottom: 2rem;
            }
            
            .reading-mode h2 {
                font-size: 2rem;
                margin-bottom: 1.5rem;
            }
            
            .reading-mode h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
            
            /* Table Styles */
            .editor-table {
                width: 100%;
                border-collapse: collapse;
                margin: 1rem 0;
            }
            
            .editor-table td, .editor-table th {
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                text-align: left;
            }
            
            .editor-table th {
                background: #f3f4f6;
                font-weight: 600;
            }
            
            .dark .editor-table td, .dark .editor-table th {
                border-color: #4b5563;
            }
            
            .dark .editor-table th {
                background: #374151;
            }
            
            /* Auto Page Break Indicator */
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
        
        // Page Break Button
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
        
        // Pagination Toggle Button
        const paginationBtn = document.createElement('button');
        paginationBtn.className = 'toolbar-btn';
        paginationBtn.title = 'Toggle Pagination View';
        paginationBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
        `;
        paginationBtn.addEventListener('click', () => this.togglePagination());
        toolbar.appendChild(paginationBtn);
        
        // Add to Tools menu
        this.addMenuItems();
    }
    
    addMenuItems() {
        const toolsMenu = document.querySelector('[data-menu] button:contains("Tools")')?.closest('[data-menu]');
        if (!toolsMenu) return;
        
        const dropdown = toolsMenu.querySelector('.menu-dropdown');
        if (!dropdown) return;
        
        // Add separator
        const separator = document.createElement('hr');
        separator.className = 'my-1 border-gray-200 dark:border-gray-700';
        dropdown.appendChild(separator);
        
        // Focus Mode
        const focusModeItem = this.createMenuItem('Focus Mode', 'M9 4v16m6-16v16M4 12h16', () => this.toggleFocusMode());
        dropdown.appendChild(focusModeItem);
        
        // Reading Mode
        const readingModeItem = this.createMenuItem('Reading Mode', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', () => this.toggleReadingMode());
        dropdown.appendChild(readingModeItem);
        
        // Insert Table
        const tableItem = this.createMenuItem('Insert Table', 'M4 6h16M4 10h16M4 14h16M4 18h16', () => this.insertTable());
        dropdown.appendChild(tableItem);
    }
    
    createMenuItem(text, pathD, onClick) {
        const item = document.createElement('button');
        item.className = 'menu-item';
        item.innerHTML = `
            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${pathD}"></path>
            </svg>
            <span>${text}</span>
        `;
        item.addEventListener('click', onClick);
        return item;
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
    
    setupResizeObserver() {
        // Watch for content changes that might affect pagination
        const observer = new MutationObserver(() => {
            if (this.isPaginationEnabled) {
                this.updatePagination();
            }
        });
        
        observer.observe(this.editor, {
            childList: true,
            subtree: true,
            characterData: true
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
        // Store original content
        this.originalContent = this.editor.innerHTML;
        this.updatePagination();
    }
    
    disablePagination() {
        // Restore original content
        if (this.originalContent) {
            this.editor.innerHTML = this.originalContent;
        }
        this.pageElements = [];
    }
    
    updatePagination() {
        if (!this.isPaginationEnabled) return;
        
        this.removePagination();
        
        const content = this.editor.innerHTML;
        const pages = this.splitContentIntoPages(content);
        
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
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // First, split by manual page breaks
        const manualBreaks = tempDiv.querySelectorAll('[data-page-break="true"], .page-break');
        const pages = [];
        
        if (manualBreaks.length > 0) {
            let currentContent = '';
            let currentNode = tempDiv.firstChild;
            
            while (currentNode) {
                if (currentNode.nodeType === Node.ELEMENT_NODE && 
                    (currentNode.dataset?.pageBreak === 'true' || currentNode.classList?.contains('page-break'))) {
                    // Found a page break, push current content and reset
                    if (currentContent.trim()) {
                        pages.push(currentContent);
                    }
                    currentContent = '';
                } else {
                    // Add node to current content
                    currentContent += currentNode.outerHTML || currentNode.textContent;
                }
                currentNode = currentNode.nextSibling;
            }
            
            // Add remaining content
            if (currentContent.trim()) {
                pages.push(currentContent);
            }
        } else {
            // No manual breaks, split by content height
            pages.push(...this.splitByContentHeight(tempDiv));
        }
        
        return pages.length > 0 ? pages : [content];
    }
    
    splitByContentHeight(container) {
        const pages = [];
        let currentPageContent = '';
        let currentHeight = 0;
        const maxPageHeight = this.pageHeight - (this.pageMargin * 2);
        
        // Create a measuring container with the same styles
        const measureContainer = document.createElement('div');
        measureContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: ${this.pageWidth - (this.pageMargin * 2)}px;
            padding: ${this.pageMargin}px;
            font-size: 14px;
            line-height: ${this.lineHeight};
            visibility: hidden;
        `;
        document.body.appendChild(measureContainer);
        
        const nodes = Array.from(container.childNodes);
        
        for (const node of nodes) {
            const nodeHtml = node.outerHTML || node.textContent;
            
            // Test if adding this node would exceed page height
            measureContainer.innerHTML = currentPageContent + nodeHtml;
            const testHeight = measureContainer.offsetHeight;
            
            if (testHeight <= maxPageHeight || currentPageContent === '') {
                // Fits in current page
                currentPageContent += nodeHtml;
                currentHeight = testHeight;
            } else {
                // Doesn't fit, start new page
                if (currentPageContent.trim()) {
                    pages.push(currentPageContent);
                }
                currentPageContent = nodeHtml;
                measureContainer.innerHTML = currentPageContent;
                currentHeight = measureContainer.offsetHeight;
            }
        }
        
        // Add the last page
        if (currentPageContent.trim()) {
            pages.push(currentPageContent);
        }
        
        document.body.removeChild(measureContainer);
        return pages;
    }
    
    calculateContentHeight(html) {
        const measure = document.createElement('div');
        measure.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: ${this.pageWidth - (this.pageMargin * 2)}px;
            padding: ${this.pageMargin}px;
            font-size: 14px;
            line-height: ${this.lineHeight};
            visibility: hidden;
        `;
        measure.innerHTML = html;
        document.body.appendChild(measure);
        const height = measure.offsetHeight;
        document.body.removeChild(measure);
        return height;
    }
    
    removePagination() {
        if (this.pageElements.length > 0) {
            this.pageElements.forEach(page => page.remove());
            this.pageElements = [];
        }
    }
    
    toggleFocusMode() {
        this.editor.classList.toggle('focus-mode');
        
        if (this.editor.classList.contains('focus-mode')) {
            // Fade out other elements
            document.querySelectorAll('#editor > *:not(.focus-mode)').forEach(el => {
                if (el !== this.editor) {
                    el.style.opacity = '0.3';
                    el.style.transition = 'opacity 0.3s ease';
                }
            });
        } else {
            // Restore opacity
            document.querySelectorAll('#editor > *').forEach(el => {
                el.style.opacity = '1';
            });
        }
    }
    
    toggleReadingMode() {
        this.editor.classList.toggle('reading-mode');
    }
    
    insertTable() {
        const tableHtml = `
            <table class="editor-table" contenteditable="true">
                <thead>
                    <tr>
                        <th>Header 1</th>
                        <th>Header 2</th>
                        <th>Header 3</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Cell 1</td>
                        <td>Cell 2</td>
                        <td>Cell 3</td>
                    </tr>
                    <tr>
                        <td>Cell 4</td>
                        <td>Cell 5</td>
                        <td>Cell 6</td>
                    </tr>
                </tbody>
            </table>
            <p><br></p>
        `;
        
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        range.insertNode(document.createRange().createContextualFragment(tableHtml));
        this.editor.focus();
    }
    
    // Enhanced word count with detailed statistics
    getDetailedWordCount() {
        const text = this.editor.innerText || '';
        const words = text.trim().split(/\s+/).filter(Boolean);
        const characters = text.length;
        const charactersNoSpaces = text.replace(/\s/g, '').length;
        const paragraphs = this.editor.querySelectorAll('p').length;
        const headings = this.editor.querySelectorAll('h1, h2, h3').length;
        
        return {
            words: words.length,
            characters: characters,
            charactersNoSpaces: charactersNoSpaces,
            paragraphs: paragraphs,
            headings: headings,
            readingTime: Math.ceil(words.length / 200) // 200 wpm
        };
    }
    
    // Export for printing with page breaks
    getContentForPrint() {
        let content = this.editor.innerHTML;
        
        // Convert page breaks to CSS page breaks for print
        content = content.replace(/<div class="page-break"[^>]*><\/div>/g, '<div style="page-break-after: always;"></div>');
        
        return content;
    }
}

// Initialize the module when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializePageForgePagination();
    });
} else {
    initializePageForgePagination();
}

function initializePageForgePagination() {
    const editor = document.getElementById('editor');
    const editorWrapper = document.getElementById('editor-wrapper');
    
    if (editor && editorWrapper) {
        window.pageForgePagination = new PageForgePagination(editor, editorWrapper);
        console.log('PageForge Pagination initialized successfully');
    } else {
        console.warn('PageForge Pagination: Editor elements not found, retrying in 500ms');
        setTimeout(initializePageForgePagination, 500);
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
