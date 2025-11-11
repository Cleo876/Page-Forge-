// PageForge Undo/Redo Module
class PageForgeUndoRedo {
    constructor(editorElement, options = {}) {
        this.editor = editorElement;
        this.maxHistorySize = options.maxHistorySize || 100;
        this.debounceTime = options.debounceTime || 300;
        
        this.history = [];
        this.currentIndex = -1;
        this.isTracking = true;
        this.lastContent = '';
        this.debounceTimer = null;
        
        this.init();
    }

    init() {
        // Store initial state
        this.lastContent = this.editor.innerHTML;
        this.history.push({
            content: this.lastContent,
            selection: this.getSelectionState(),
            timestamp: Date.now()
        });
        this.currentIndex = 0;

        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Undo/Redo system initialized');
    }

    setupEventListeners() {
        // Input events
        this.editor.addEventListener('input', this.handleInput.bind(this));
        
        // Keyboard events for undo/redo shortcuts
        this.editor.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Focus events to capture selection state
        this.editor.addEventListener('focus', this.saveSelectionState.bind(this));
        this.editor.addEventListener('blur', this.saveSelectionState.bind(this));
        
        // Mouse events for selection changes
        this.editor.addEventListener('mouseup', this.saveSelectionState.bind(this));
        
        // MutationObserver for DOM changes that might not trigger input events
        this.setupMutationObserver();
    }

    setupMutationObserver() {
        this.mutationObserver = new MutationObserver((mutations) => {
            // Only track if we're not currently restoring a state
            if (this.isTracking) {
                const hasSignificantChange = mutations.some(mutation => {
                    // Ignore text changes (handled by input event) and focus changes
                    if (mutation.type === 'characterData') return false;
                    
                    // Check for node additions/removals that aren't just text
                    if (mutation.type === 'childList') {
                        return Array.from(mutation.addedNodes).some(node => 
                            node.nodeType !== Node.TEXT_NODE
                        ) || mutation.removedNodes.length > 0;
                    }
                    
                    return true;
                });

                if (hasSignificantChange) {
                    this.debouncedSaveState();
                }
            }
        });

        this.mutationObserver.observe(this.editor, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'id']
        });
    }

    handleInput(event) {
        if (this.isTracking) {
            this.debouncedSaveState();
        }
    }

    handleKeydown(event) {
        // Ctrl+Z for undo, Ctrl+Y or Ctrl+Shift+Z for redo
        if (event.ctrlKey || event.metaKey) {
            if (event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.undo();
            } else if ((event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
                event.preventDefault();
                this.redo();
            }
        }
    }

    debouncedSaveState() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.saveState();
        }, this.debounceTime);
    }

    saveState() {
        if (!this.isTracking) return;

        const currentContent = this.editor.innerHTML;
        
        // Don't save if content hasn't changed
        if (currentContent === this.lastContent) return;

        // Remove future states if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Add new state
        this.history.push({
            content: currentContent,
            selection: this.getSelectionState(),
            timestamp: Date.now()
        });

        // Enforce max history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.lastContent = currentContent;
        
        // Update UI if callback provided
        if (this.onStateChange) {
            this.onStateChange(this.canUndo(), this.canRedo());
        }
    }

    saveSelectionState() {
        if (this.isTracking && this.currentIndex >= 0) {
            // Update the current state with latest selection
            this.history[this.currentIndex].selection = this.getSelectionState();
        }
    }

    getSelectionState() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        return {
            startContainer: this.getNodePath(range.startContainer),
            startOffset: range.startOffset,
            endContainer: this.getNodePath(range.endContainer),
            endOffset: range.endOffset
        };
    }

    getNodePath(node) {
        const path = [];
        let currentNode = node;
        
        while (currentNode && currentNode !== this.editor) {
            const parent = currentNode.parentNode;
            if (parent) {
                const index = Array.from(parent.childNodes).indexOf(currentNode);
                path.unshift(index);
            }
            currentNode = parent;
        }
        
        return path;
    }

    restoreSelection(selectionState) {
        if (!selectionState) return;

        try {
            const range = document.createRange();
            const startNode = this.getNodeFromPath(selectionState.startContainer);
            const endNode = this.getNodeFromPath(selectionState.endContainer);
            
            if (startNode && endNode) {
                range.setStart(startNode, selectionState.startOffset);
                range.setEnd(endNode, selectionState.endOffset);
                
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } catch (error) {
            console.warn('Could not restore selection:', error);
        }
    }

    getNodeFromPath(path) {
        let node = this.editor;
        for (const index of path) {
            if (node.childNodes.length > index) {
                node = node.childNodes[index];
            } else {
                return null;
            }
        }
        return node;
    }

    undo() {
        if (this.canUndo()) {
            this.isTracking = false;
            
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            
            this.editor.innerHTML = state.content;
            this.lastContent = state.content;
            
            // Restore selection after a brief delay to allow DOM update
            setTimeout(() => {
                this.restoreSelection(state.selection);
                this.isTracking = true;
            }, 10);

            if (this.onStateChange) {
                this.onStateChange(this.canUndo(), this.canRedo());
            }
            
            return true;
        }
        return false;
    }

    redo() {
        if (this.canRedo()) {
            this.isTracking = false;
            
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            
            this.editor.innerHTML = state.content;
            this.lastContent = state.content;
            
            // Restore selection after a brief delay to allow DOM update
            setTimeout(() => {
                this.restoreSelection(state.selection);
                this.isTracking = true;
            }, 10);

            if (this.onStateChange) {
                this.onStateChange(this.canUndo(), this.canRedo());
            }
            
            return true;
        }
        return false;
    }

    canUndo() {
        return this.currentIndex > 0;
    }

    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    clearHistory() {
        const currentState = this.history[this.currentIndex];
        this.history = [currentState];
        this.currentIndex = 0;
    }

    getHistorySize() {
        return this.history.length;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    // Method to manually save a state (useful for programmatic changes)
    manualSave() {
        this.saveState();
    }

    // Cleanup method
    destroy() {
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        clearTimeout(this.debounceTimer);
    }
}
