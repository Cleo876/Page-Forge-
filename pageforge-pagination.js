// PageForge Visual Pagination Module
// Filename: pageforge-pagination.js
// Purpose: Adds visual page boundaries without interfering with content

class PageForgePagination {
    constructor(editor) {
        this.editor = editor;
        this.editorWrapper = document.getElementById('editor-wrapper');
        this.isPaginationEnabled = false; // Disabled by default - user can enable
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
        console.log('Visual Pagination initialized (disabled by default)');
    }
    
    setupStyles() {
        if (document.getElementById('visual-pagination-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'visual-pagination-styles';
        style.textContent = `
            /* Visual Page Overlay - Non-intrusive */
            .visual-pagination-enabled #editor {
                position: relative;
                background: transparent !important;
                /* Keep all original styles - we don't override anything important */
            }
            
            /* Page Boundary Overlay */
            .page-boundary-overlay {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                width: ${this.pageWidth}px;
                height: ${this.pageHeight}px;
                pointer-events: none;
                z-index: 5;
                background: 
                    /* Paper shadow effect */
                    linear-gradient(to bottom, 
                        transparent 0%,
                        rgba(0,0,0,0.02) ${this.pageHeight - 20}px,
                        rgba(0,0,0,0.04) ${this.pageHeight - 10}px,
                        rgba(0,0,0,0.08) ${this.pageHeight}px,
                        transparent ${this.pageHeight + 10}px
                    ),
                    /* Page border */
                    linear-gradient(to bottom,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(0,0,0,0.1) ${this.pageMargin}px,
                        rgba(0,0,0,0.1) ${this.pageHeight - this.pageMargin}px,
                        transparent ${this.pageHeight - this.pageMargin}px,
                        transparent 100%
                    ),
                    /* Left and right borders */
                    linear-gradient(to right,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(0,0,0,0.1) ${this.pageMargin}px,
                        rgba(0,0,0,0.1) ${this.pageWidth - this.pageMargin}px,
                        transparent ${this.pageWidth - this.pageMargin}px,
                        transparent 100%
                    );
                border-radius: 2px;
            }
            
            .dark .page-boundary-overlay {
                background: 
                    /* Paper shadow effect for dark mode */
                    linear-gradient(to bottom, 
                        transparent 0%,
                        rgba(255,255,255,0.02) ${this.pageHeight - 20}px,
                        rgba(255,255,255,0.04) ${this.pageHeight - 10}px,
                        rgba(255,255,255,0.08) ${this.pageHeight}px,
                        transparent ${this.pageHeight + 10}px
                    ),
                    /* Page border for dark mode */
                    linear-gradient(to bottom,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(255,255,255,0.1) ${this.pageMargin}px,
                        rgba(255,255,255,0.1) ${this.pageHeight - this.pageMargin}px,
                        transparent ${this.pageHeight - this.pageMargin}px,
                        transparent 100%
                    ),
                    /* Left and right borders for dark mode */
                    linear-gradient(to right,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(255,255,255,0.1) ${this.pageMargin}px,
                        rgba(255,255,255,0.1) ${this.pageWidth - this.pageMargin}px,
                        transparent ${this.pageWidth - this.pageMargin}px,
                        transparent 100%
                    );
            }
            
            /* Page Number Indicator */
            .page-number-indicator {
                position: absolute;
                bottom: ${this.pageMargin - 25}px;
                right: ${this.pageMargin}px;
                font-size: 11px;
                color: #6b7280;
                font-weight: 500;
                font-family: 'Inter', sans-serif;
                background: rgba(255,255,255,0.9);
                padding: 2px 6px;
                border-radius: 3px;
                border: 1px solid rgba(0,0,0,0.1);
            }
            
            .dark .page-number-indicator {
                color: #9ca3af;
                background: rgba(31, 41, 55, 0.9);
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            /* Writing Guidelines (Very Subtle) */
            .writing-guidelines-overlay {
                position: absolute;
                top: ${this.pageMargin}px;
                bottom: ${this.pageMargin}px;
                left: ${this.pageMargin}px;
                right: ${this.pageMargin}px;
                pointer-events: none;
                z-index: 4;
                opacity: 0.02;
                background-image: 
                    repeating-linear-gradient(
                        to bottom,
                        transparent,
                        transparent 23px,
                        #4b5563 23px,
                        #4b5563 24px
                    );
            }
            
            .dark .writing-guidelines-overlay {
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
            .page-boundary-overlay.current-page {
                background: 
                    /* Enhanced paper shadow for current page */
                    linear-gradient(to bottom, 
                        transparent 0%,
                        rgba(79, 70, 229, 0.05) ${this.pageHeight - 20}px,
                        rgba(79, 70, 229, 0.1) ${this.pageHeight - 10}px,
                        rgba(79, 70, 229, 0.15) ${this.pageHeight}px,
                        transparent ${this.pageHeight + 10}px
                    ),
                    /* Enhanced border for current page */
                    linear-gradient(to bottom,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(79, 70, 229, 0.3) ${this.pageMargin}px,
                        rgba(79, 70, 229, 0.3) ${this.pageHeight - this.pageMargin}px,
                        transparent ${this.pageHeight - this.pageMargin}px,
                        transparent 100%
                    ),
                    /* Enhanced left and right borders */
                    linear-gradient(to right,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(79, 70, 229, 0.3) ${this.pageMargin}px,
                        rgba(79, 70, 229, 0.3) ${this.pageWidth - this.pageMargin}px,
                        transparent ${this.pageWidth - this.pageMargin}px,
                        transparent 100%
                    );
            }
            
            .dark .page-boundary-overlay.current-page {
                background: 
                    linear-gradient(to bottom, 
                        transparent 0%,
                        rgba(99, 102, 241, 0.05) ${this.pageHeight - 20}px,
                        rgba(99, 102, 241, 0.1) ${this.pageHeight - 10}px,
                        rgba(99, 102, 241, 0.15) ${this.pageHeight}px,
                        transparent ${this.pageHeight + 10}px
                    ),
                    linear-gradient(to bottom,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(99, 102, 241, 0.4) ${this.pageMargin}px,
                        rgba(99, 102, 241, 0.4) ${this.pageHeight - this.pageMargin}px,
                        transparent ${this.pageHeight - this.pageMargin}px,
                        transparent 100%
                    ),
                    linear-gradient(to right,
                        transparent 0%,
                        transparent ${this.pageMargin}px,
                        rgba(99, 102, 241, 0.4) ${this.pageMargin}px,
                        rgba(99, 102, 241, 0.4) ${this.pageWidth - this.pageMargin}px,
                        transparent ${this.pageWidth - this.pageMargin}px,
                        transparent 100%
                    );
            }
            
            /* Toolbar button styling */
            .pagination-toggle-btn.active {
                background-color: #dbeafe !important;
                color: #1d4ed8 !important;
            }
            
            .dark .pagination-toggle-btn.active {
                background-color: #1e3a8a !important;
                color: #93c5fd !important;
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
        
        // Visual Pagination Toggle Button
        this.paginationToggleBtn = document.createElement('button');
        this.paginationToggleBtn.className = 'toolbar-btn pagination-toggle-btn';
        this.paginationToggleBtn.title = 'Toggle Page Boundaries';
        this.paginationToggleBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
        `;
        this.paginationToggleBtn.addEventListener('click', () => this.toggleVisualPagination());
        toolbar.appendChild(this.paginationToggleBtn);
        
        console.log('Visual pagination button added to toolbar');
    }
    
    setupEventListeners() {
        // Update current page on scroll
        this.editorWrapper.addEventListener('scroll', () => {
            if (this.isPaginationEnabled) {
                this.updateCurrentPageIndicator();
            }
        });
        
        console.log('Visual pagination listeners setup');
    }
    
    toggleVisualPagination() {
        this.isPaginationEnabled = !this.isPaginationEnabled;
        
        if (this.isPaginationEnabled) {
            this.enableVisualPagination();
            this.paginationToggleBtn.classList.add('active');
        } else {
            this.disableVisualPagination();
            this.paginationToggleBtn.classList.remove('active');
        }
        
        console.log('Visual pagination toggled:', this.isPaginationEnabled);
    }
    
    enableVisualPagination() {
        this.editorWrapper.classList.add('visual-pagination-enabled');
        this.createPageBoundaries();
        this.updateCurrentPageIndicator();
        console.log('Visual page boundaries enabled');
    }
    
    disableVisualPagination() {
        this.editorWrapper.classList.remove('visual-pagination-enabled');
        this.removePageBoundaries();
        console.log('Visual page boundaries disabled');
    }
    
    createPageBoundaries() {
        this.removePageBoundaries(); // Clear any existing boundaries
        
        const contentHeight = this.editor.scrollHeight;
        const numberOfPages = Math.ceil(contentHeight / this.pageHeight);
        
        // Create page boundary overlays
        for (let i = 0; i < numberOfPages; i++) {
            const pageBoundary = document.createElement('div');
            pageBoundary.className = 'page-boundary-overlay';
            pageBoundary.style.top = `${i * this.pageHeight}px`;
            pageBoundary.dataset.pageNumber = i + 1;
            
            // Add page number
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number-indicator';
            pageNumber.textContent = `Page ${i + 1}`;
            pageBoundary.appendChild(pageNumber);
            
            // Add writing guidelines (optional)
            const guidelines = document.createElement('div');
            guidelines.className = 'writing-guidelines-overlay';
            pageBoundary.appendChild(guidelines);
            
            this.editor.appendChild(pageBoundary);
            this.pageElements.push(pageBoundary);
        }
        
        console.log(`Created ${numberOfPages} visual page boundaries`);
    }
    
    removePageBoundaries() {
        this.pageElements.forEach(element => element.remove());
        this.pageElements = [];
    }
    
    updateCurrentPageIndicator() {
        const boundaries = this.editor.querySelectorAll('.page-boundary-overlay');
        const wrapperRect = this.editorWrapper.getBoundingClientRect();
        const wrapperCenter = wrapperRect.top + (wrapperRect.height / 2);
        
        boundaries.forEach(boundary => {
            boundary.classList.remove('current-page');
            
            const boundaryRect = boundary.getBoundingClientRect();
            const boundaryCenter = boundaryRect.top + (boundaryRect.height / 2);
            
            // Check if this boundary is currently in view
            if (Math.abs(boundaryCenter - wrapperCenter) < wrapperRect.height * 0.3) {
                boundary.classList.add('current-page');
            }
        });
    }
    
    // Public method to check if pagination is enabled
    isEnabled() {
        return this.isPaginationEnabled;
    }
}

// Initialize when DOM is ready - but don't auto-enable
if (typeof window !== 'undefined') {
    window.PageForgePagination = PageForgePagination;
    
    document.addEventListener('DOMContentLoaded', () => {
        const editor = document.getElementById('editor');
        if (editor) {
            // Create instance but don't enable by default
            window.pageForgePagination = new PageForgePagination(editor);
            console.log('Visual Pagination ready - click the grid button to enable');
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgePagination;
}
