/**
 * PageForge Pagination & Enhanced Features Module (v2.0)
 * Replaces the old page-break system with a fully automatic,
 * "Google Docs" style paged layout.
 */
class PageForgePagination {
    constructor(editor, editorWrapper) {
        this.editor = editor;
        this.editorWrapper = editorWrapper;
        
        // A4 dimensions in pixels (approx)
        this.pageHeight = 1122;
        this.pagePadding = 96;
        this.pageInnerHeight = this.pageHeight - (this.pagePadding * 2);

        this.isReflowing = false; // Prevents recursive loops
        
        console.log("PageForge Pagination Module (v2.0) Initializing...");
        this.init();
    }

    init() {
        this.setupStyles();
        this.editorWrapper.classList.add('pagination-view');
        this.wrapInitialContent();
        this.setupEventListeners();
        this.addToolbarButtons(); // Keep the other useful buttons
        this.reflowAllPages(); // Do an initial check
    }

    /**
     * Injects the CSS needed for the "sheet of paper" layout.
     */
    setupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* This is the gray background */
            #editor-wrapper.pagination-view {
                background-color: #f3f4f6;
            }
            .dark #editor-wrapper.pagination-view {
                background-color: #111827;
            }
            
            /* This is the container for all the 'pages' */
            .pagination-view #editor {
                display: flex;
                flex-direction: column;
                align-items: center;
                /* Remove the 'page' styling from the editor itself */
                background: transparent;
                box-shadow: none;
                padding: 0;
                min-height: 0;
                width: 100%;
                contenteditable: false; /* The container is not editable */
            }
            
            /* This is the new 'page' (sheet of paper) */
            .page {
                width: 816px;
                height: 1122px; /* Fixed A4 height */
                padding: ${this.pagePadding}px;
                background: white;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                margin-bottom: 1rem;
                box-sizing: border-box;
                position: relative;
                overflow: hidden; /* This is critical */
                contenteditable: true; /* The pages ARE editable */
            }
            
            .page:focus-within {
                outline: 1px solid #4F46E5;
            }
            
            .dark .page {
                background: #1f2937; /* A slightly lighter dark for the page */
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            .page > *:last-child {
                 margin-bottom: 0; /* No margin on the last item */
            }
            
            /* Styles from old module (Focus, Reading, Table) */
            /* These are kept as they are still useful */
            .focus-mode { background: #fef3c7 !important; }
            .dark .focus-mode { background: #78350f !important; }
            .reading-mode { max-width: 800px; margin: 0 auto; line-height: 1.8; font-size: 18px; }
            .editor-table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            .editor-table td, .editor-table th { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
            .editor-table th { background: #f3f4f6; font-weight: 600; }
            .dark .editor-table td, .dark .editor-table th { border-color: #4b5563; }
            .dark .editor-table th { background: #374151; }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Takes existing content in the editor and wraps it into the first page.
     */
    wrapInitialContent() {
        const children = Array.from(this.editor.children);
        this.editor.innerHTML = ''; // Clear the editor
        
        const firstPage = this.createPage();
        this.editor.appendChild(firstPage);

        // Move all existing children into the first page
        children.forEach(child => {
            // Skip the pin if it's somehow a direct child
            if (child.id !== 'section-pin') {
                firstPage.appendChild(child);
            }
        });

        // Ensure the editor is not empty
        if (firstPage.children.length === 0) {
            firstPage.innerHTML = '<p><br></p>';
        }
    }

    /**
     * Factory function to create a new, empty page element.
     */
    createPage(content = null) {
        const page = document.createElement('div');
        page.className = 'page';
        page.setAttribute('contenteditable', 'true');
        if (content) {
            page.innerHTML = content;
        }
        return page;
    }

    /**
     * Sets up the event listeners to detect overflow.
     */
    setupEventListeners() {
        // 'input' is the most reliable event for this
        this.editor.addEventListener('input', (e) => {
            const page = e.target.closest('.page');
            if (page) {
                this.reflow(page);
            }
        });
        
        // Also check on paste
        this.editor.addEventListener('paste', (e) => {
             const page = e.target.closest('.page');
             if (page) {
                // Pasting needs a slight delay for content to render
                setTimeout(() => this.reflow(page), 1);
             }
        });
    }

    /**
     * This is the core logic. It checks a page for overflow or underflow
     * and moves content accordingly.
     */
    reflow(page) {
        // Prevent recursive loops
        if (this.isReflowing) return;
        this.isReflowing = true;

        // 1. --- Handle Overflow (pushing content down) ---
        // We use pageInnerHeight because the page itself has padding
        while (page.scrollHeight > this.pageInnerHeight) {
            let lastEl = page.lastElementChild;
            if (!lastEl) break; // Should be impossible if overflowing

            // Get or create the next page
            let nextPage = page.nextElementSibling;
            if (!nextPage) {
                nextPage = this.createPage();
                this.editor.appendChild(nextPage);
            }
            
            // Move the last element to the *top* of the next page
            nextPage.insertBefore(lastEl, nextPage.firstChild);
        }

        // 2. --- Handle Underflow (pulling content up) ---
        // (Don't run this on the *last* page)
        let nextPage = page.nextElementSibling;
        while (nextPage && page.scrollHeight < this.pageInnerHeight) {
            let firstEl = nextPage.firstElementChild;
            if (!firstEl) {
                // Next page is empty, remove it
                this.editor.removeChild(nextPage);
                nextPage = page.nextElementSibling; // Get the *new* next page
                continue; // Re-run the loop
            }

            // Temporarily move the element to see if it fits
            page.appendChild(firstEl);

            if (page.scrollHeight > this.pageInnerHeight) {
                // It doesn't fit, put it back
                nextPage.insertBefore(firstEl, nextPage.firstChild);
                break; // Stop pulling content up
            }
            // It fits! The loop will continue and check for more space.
        }

        // 3. --- Ensure last page exists ---
        if (!this.editor.lastElementChild) {
            this.editor.appendChild(this.createPage('<p><br></p>'));
        }

        this.isReflowing = false;
    }
    
    /**
     * A utility to manually reflow all pages in the document.
     */
    reflowAllPages() {
         this.isReflowing = true;
         let page = this.editor.firstElementChild;
         while(page) {
            const nextPage = page.nextElementSibling; // Get next before reflow
            this.reflow(page);
            page = nextPage;
         }
         this.isReflowing = false;
    }

    // --- Kept Features from v1 ---

    addToolbarButtons() {
        // These features are still great, but we remove the
        // "Page Break" and "Pagination Toggle" buttons.
        this.addMenuItems();
    }

    addMenuItems() {
        const toolsMenu = Array.from(document.querySelectorAll('[data-menu]')).find(menu => 
            menu.querySelector('.menu-btn')?.textContent?.includes('Tools')
        );
        
        if (!toolsMenu) return;
        
        const dropdown = toolsMenu.querySelector('.menu-dropdown');
        
        const separator = document.createElement('hr');
        separator.className = 'my-1 border-gray-200 dark:border-gray-700';
        dropdown.appendChild(separator);
        
        const focusModeItem = this.createMenuItem('Focus Mode', 'M9 4v16m6-16v16M4 12h16', () => this.toggleFocusMode());
        dropdown.appendChild(focusModeItem);
        
        const readingModeItem = this.createMenuItem('Reading Mode', 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', () => this.toggleReadingMode());
        dropdown.appendChild(readingModeItem);
        
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

    toggleFocusMode() {
        // This feature needs to target the *pages* now, not the editor
        this.editor.querySelectorAll('.page').forEach(page => {
            page.classList.toggle('focus-mode');
        });
        
        if (this.editor.querySelector('.focus-mode')) {
            // Fade out other elements
            document.querySelectorAll('body > *:not(#app-container), #app-container > *:not(main), main > *:not(#editor-wrapper), #hierarchy-sidebar').forEach(el => {
                el.style.opacity = '0.3';
                el.style.transition = 'opacity 0.3s ease';
            });
        } else {
            // Restore opacity
             document.querySelectorAll('body > *, #app-container > *, main > *, #hierarchy-sidebar').forEach(el => {
                el.style.opacity = '1';
            });
        }
    }

    toggleReadingMode() {
        this.editor.classList.toggle('reading-mode');
    }

    insertTable() {
        const tableHtml = `
            <table class="editor-table">
                <thead>
                    <tr><th>Header 1</th><th>Header 2</th></tr>
                </thead>
                <tbody>
                    <tr><td>Cell 1</td><td>Cell 2</td></tr>
                    <tr><td>Cell 3</td><td>Cell 4</td></tr>
                </tbody>
            </table>
            <p><br></p> <!-- Space after table -->
        `;
        
        // Find the current selection and insert there
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const fragment = range.createContextualFragment(tableHtml);
        range.insertNode(fragment);
        
        // Move cursor to the paragraph after the table
        const newParagraph = range.endContainer.nextElementSibling;
        if (newParagraph && newParagraph.tagName === 'P') {
            const newRange = document.createRange();
            newRange.setStart(newParagraph, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
        
        this.editor.focus();
    }
}

// Update the main app's initialization
document.addEventListener('DOMContentLoaded', () => {
    // This script now runs *after* the main script in PageForge.html
    // We need to wait for the main script's DOMContentLoaded to finish
    // A small timeout ensures all main elements are ready.
    setTimeout(() => {
        const editor = document.getElementById('editor');
        const editorWrapper = document.getElementById('editor-wrapper');
        
        if (editor && editorWrapper && !window.pageForgePagination) {
            window.pageForgePagination = new PageForgePagination(editor, editorWrapper);
        }
    }, 100); // 100ms delay
});
