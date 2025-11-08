// PageForge Pagination & Enhanced Features Module
// Filename: pageforge-pagination.js
// Purpose: Adds page breaks, pagination view, and professional writing features

class PageForgePagination {
    constructor(editor) {
        this.editor = editor;
        this.editorWrapper = document.getElementById('editor-wrapper');
        this.isPaginationEnabled = false;
        this.pageElements = [];
        
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
    }
    
    setupStyles() {
        // Check if styles already exist
        if (document.getElementById('pagination-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'pagination-styles';
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
            
            /* Pagination View */
            .pagination-enabled #editor {
                box-shadow: none !important;
                min-height: auto !important;
                margin-bottom: 32px;
                background: transparent !important;
                width: 100% !important;
                padding: 0 !important;
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
                overflow: hidden;
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

            /* Auto page break indicator */
            .auto-page-break {
                border-top: 1px dotted #e5e7eb;
                margin: 10px 0;
                opacity: 0.5;
            }
            
            .dark .auto-page-break {
                border-top-color: #4b5563;
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
        
        console.log('Pagination buttons added to toolbar');
    }
    
    addMenuItems() {
        // Find the Tools menu by looking for the button with text "Tools"
        const menuButtons = document.querySelectorAll('[data-menu] .menu-btn');
        let toolsMenu = null;
        
        menuButtons.forEach(btn => {
            if (btn.textContent.trim() === 'Tools') {
                toolsMenu = btn.closest('[data-menu]');
            }
        });
        
        if (!toolsMenu) {
            console.log('Tools menu not found');
            return;
        }
        
        const dropdown = toolsMenu.querySelector('.menu-dropdown');
        if (!dropdown) {
            console.log('Tools dropdown not found');
            return;
        }
        
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
        
        console.log('Pagination menu items added');
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
        
        console.log('Pagination event listeners set up');
    }
    
    insertPageBreak() {
        const pageBreak = document.createElement('div');
        pageBreak.className = 'page-break';
        pageBreak.contentEditable = 'false';
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
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
        
        this.editor.focus();
        
        console.log('Page break inserted');
    }
    
    togglePagination() {
        this.isPaginationEnabled = !this.isPaginationEnabled;
        
        if (this.editorWrapper) {
            this.editorWrapper.classList.toggle('pagination-enabled', this.isPaginationEnabled);
        }
        
        if (this.isPaginationEnabled) {
            this.enablePagination();
        } else {
            this.disablePagination();
        }
        
        console.log('Pagination toggled:', this.isPaginationEnabled);
    }
    
    enablePagination() {
        // Store original content
        this.originalContent = this.editor.innerHTML;
        
        // Apply automatic page breaks based on content
        this.applyAutomaticPageBreaks();
    }
    
    disablePagination() {
        // Restore original content
        if (this.originalContent) {
            this.editor.innerHTML = this.originalContent;
        }
        
        // Remove any page containers
        const pageContainers = this.editor.querySelectorAll('.page-container');
        pageContainers.forEach(container => container.remove());
    }
    
    applyAutomaticPageBreaks() {
        const content = this.editor.innerHTML;
        
        // Simple character-based page breaking
        // A4 page can hold approximately 3000-4000 characters
        const charsPerPage = 3500;
        
        if (content.length > charsPerPage) {
            // Split content into pages based on character count
            const pages = [];
            let remainingContent = content;
            
            while (remainingContent.length > 0) {
                // Find a good breaking point (end of paragraph or heading)
                const breakPoint = this.findGoodBreakPoint(remainingContent, charsPerPage);
                const pageContent = remainingContent.substring(0, breakPoint);
                const nextContent = remainingContent.substring(breakPoint);
                
                pages.push(pageContent);
                remainingContent = nextContent;
            }
            
            // Render pages
            this.renderPages(pages);
        } else {
            // Single page
            this.renderPages([content]);
        }
    }
    
    findGoodBreakPoint(content, targetLength) {
        if (content.length <= targetLength) {
            return content.length;
        }
        
        // Look for paragraph endings, heading tags, or natural breaks
        const breakPoints = [
            content.lastIndexOf('</p>', targetLength),
            content.lastIndexOf('</h1>', targetLength),
            content.lastIndexOf('</h2>', targetLength),
            content.lastIndexOf('</h3>', targetLength),
            content.lastIndexOf('</div>', targetLength),
            content.lastIndexOf('<br>', targetLength),
            content.lastIndexOf(' ', targetLength)
        ];
        
        // Find the best break point
        for (const point of breakPoints) {
            if (point > targetLength * 0.7 && point < targetLength * 1.3) {
                return point;
            }
        }
        
        // Default to target length
        return Math.min(targetLength, content.length);
    }
    
    renderPages(pages) {
        this.editor.innerHTML = '';
        
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
        
        console.log(`Rendered ${pages.length} pages`);
    }
    
    toggleFocusMode() {
        this.editor.classList.toggle('focus-mode');
        
        if (this.editor.classList.contains('focus-mode')) {
            // Fade out other elements
            document.querySelectorAll('#app-container > *:not(#editor)').forEach(el => {
                el.style.opacity = '0.3';
                el.style.transition = 'opacity 0.3s ease';
            });
        } else {
            // Restore opacity
            document.querySelectorAll('#app-container > *').forEach(el => {
                el.style.opacity = '1';
            });
        }
        
        console.log('Focus mode toggled');
    }
    
    toggleReadingMode() {
        this.editor.classList.toggle('reading-mode');
        console.log('Reading mode toggled');
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
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        range.insertNode(document.createRange().createContextualFragment(tableHtml));
        this.editor.focus();
        
        console.log('Table inserted');
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
