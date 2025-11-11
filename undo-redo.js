// PageForge Undo/Redo Module - Character Level
class PageForgeUndoRedo {
    constructor(editorElement, options = {}) {
        this.editor = editorElement;
        this.maxHistorySize = options.maxHistorySize || 200;
        this.typingDelay = options.typingDelay || 1000; // Time to group typing actions
        this.immediateSaveCommands = options.immediateSaveCommands || ['insertUnorderedList', 'insertOrderedList', 'formatBlock'];
        
        this.history = [];
        this.currentIndex = -1;
        this.isTracking = true;
        this.lastContent = '';
        this.typingTimer = null;
        this.lastInputTime = 0;
        
        this.init();
    }

    init() {
        // Store initial state
        this.lastContent = this.editor.innerHTML;
        this.history.push({
            content: this.lastContent,
            selection: this.getSelectionState(),
            timestamp: Date.now(),
            type: 'initial'
        });
        this.currentIndex = 0;

        // Set up event listeners
        this.setupEventListeners();
        
        console.log('Undo/Redo system initialized with character-level tracking');
    }

    setupEventListeners() {
        // Input events - handle different types of input
        this.editor.addEventListener('input', this.handleInput.bind(this));
        
        // Keyboard events for undo/redo shortcuts and special keys
        this.editor.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Focus events to capture selection state
        this.editor.addEventListener('focus', this.saveSelectionState.bind(this));
        this.editor.addEventListener('blur', this.saveSelectionState.bind(this));
        
        // Mouse events for selection changes
        this.editor.addEventListener('mouseup', this.saveSelectionState.bind(this));
        
        // Clipboard events
        this.editor.addEventListener('paste', this.handlePaste.bind(this));
        this.editor.addEventListener('cut', this.handleCut.bind(this));
        
        // Composition events for IME input (important for non-latin languages)
        this.editor.addEventListener('compositionstart', this.handleCompositionStart.bind(this));
        this.editor.addEventListener('compositionend', this.handleCompositionEnd.bind(this));
    }

    handleInput(event) {
        if (!this.isTracking) return;

        const inputType = event.inputType;
        const currentTime = Date.now();
        const timeSinceLastInput = currentTime - this.lastInputTime;
        
        // Clear any existing typing timer
        clearTimeout(this.typingTimer);
        
        // Handle different input types
        switch (inputType) {
            case 'insertText':
            case 'insertCompositionText':
                // For character insertion, save immediately for character-level undo
                // but group rapid typing within the typing delay
                if (timeSinceLastInput > this.typingDelay) {
                    // New typing session, save state immediately
                    this.saveState('typing-start');
                }
                
                // Set timer to save the final state after typing stops
                this.typingTimer = setTimeout(() => {
                    this.saveState('typing-end');
                }, this.typingDelay);
                break;
                
            case 'deleteContentBackward':
            case 'deleteContentForward':
            case 'deleteWordBackward':
            case 'deleteWordForward':
                // For deletion, save immediately for precise undo
                this.saveState('deletion');
                break;
                
            case 'insertParagraph':
            case 'insertLineBreak':
                // For new lines, save immediately
                this.saveState('line-break');
                break;
                
            case 'formatBold':
            case 'formatItalic':
            case 'formatUnderline':
            case 'formatStrikeThrough':
                // For formatting changes, save immediately
                this.saveState('formatting');
                break;
                
            default:
                // For other input types, use immediate save
                this.saveState('other');
                break;
        }
        
        this.lastInputTime = currentTime;
    }

    handleKeydown(event) {
        // Handle undo/redo shortcuts
        if ((event.ctrlKey || event.metaKey) && !event.altKey) {
            if (event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                this.undo();
                return;
            } else if ((event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
                event.preventDefault();
                this.redo();
                return;
            }
        }
        
        // Handle Enter key - save immediately for new paragraphs
        if (event.key === 'Enter') {
            // Clear typing timer since Enter starts a new context
            clearTimeout(this.typingTimer);
            // Save will be handled by input event with 'insertParagraph' type
        }
        
        // Handle space key - can be considered a word boundary
        if (event.key === ' ') {
            // Optionally save on space for word-level granularity
            // Uncomment the line below if you want word-level undo instead of character-level
            // this.saveState('word-boundary');
        }
        
        // Handle backspace/delete - save will be handled by input event
        if (event.key === 'Backspace' || event.key === 'Delete') {
            // Save is handled by input event with deletion types
        }
    }

    handlePaste(event) {
        if (!this.isTracking) return;
        
        // Save state before paste occurs
        this.saveState('pre-paste');
        
        // Let the paste happen naturally, then it will trigger input event
    }

    handleCut(event) {
        if (!this.isTracking) return;
        
        // Save state before cut occurs
        this.saveState('pre-cut');
    }

    handleCompositionStart(event) {
        // IME composition started (for languages like Chinese, Japanese, etc.)
        if (!this.isTracking) return;
        
        // Save state before composition starts
        this.saveState('composition-start');
    }

    handleCompositionEnd(event) {
        // IME composition ended
        if (!this.isTracking) return;
        
        // Composition end will trigger an input event, so we don't need to save here
    }

    saveState(type = 'auto') {
        if (!this.isTracking) return;

        const currentContent = this.editor.innerHTML;
        
        // Don't save if content hasn't changed (except for selection-only changes)
        if (currentContent === this.lastContent && type !== 'selection') return;

        // Remove future states if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        // Check if this is a continuation of the previous action
        const isContinuation = this.shouldGroupWithPrevious(type);
        
        if (!isContinuation) {
            // Add new state
            this.history.push({
                content: currentContent,
                selection: this.getSelectionState(),
                timestamp: Date.now(),
                type: type
            });

            // Enforce max history size
            if (this.history.length > this.maxHistorySize) {
                this.history.shift();
            } else {
                this.currentIndex++;
            }
        } else {
            // Update the most recent state with current content
            if (this.currentIndex >= 0) {
                this.history[this.currentIndex] = {
                    content: currentContent,
                    selection: this.getSelectionState(),
                    timestamp: Date.now(),
                    type: this.history[this.currentIndex].type + '-continued'
                };
            }
        }

        this.lastContent = currentContent;
        
        // Update UI if callback provided
        if (this.onStateChange) {
            this.onStateChange(this.canUndo(), this.canRedo());
        }
        
        console.log(`Saved state (${type}):`, {
            index: this.currentIndex,
            historySize: this.history.length,
            continuation: isContinuation
        });
    }

    shouldGroupWithPrevious(currentType) {
        if (this.currentIndex < 0) return false;
        
        const previousState = this.history[this.currentIndex];
        const currentTime = Date.now();
        const timeSincePrevious = currentTime - previousState.timestamp;
        
        // Group typing actions within the typing delay
        if ((currentType === 'typing-end' || currentType === 'typing-start') && 
            previousState.type.includes('typing') && 
            timeSincePrevious < this.typingDelay) {
            return true;
        }
        
        // Don't group different types of actions
        if (!currentType.includes(previousState.type) && !previousState.type.includes(currentType)) {
            return false;
        }
        
        // For rapid consecutive actions of the same type, consider grouping
        return timeSincePrevious < 500; // 500ms threshold for grouping similar actions
    }

    saveSelectionState() {
        if (this.isTracking && this.currentIndex >= 0) {
            // Update the current state with latest selection
            const currentState = this.history[this.currentIndex];
            this.history[this.currentIndex] = {
                ...currentState,
                selection: this.getSelectionState(),
                timestamp: Date.now()
            };
        }
    }

    getSelectionState() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return null;

        const range = selection.getRangeAt(0);
        
        // Create a more robust selection state that can handle DOM changes
        const selectionState = {
            startContainer: this.getNodePath(range.startContainer),
            startOffset: range.startOffset,
            endContainer: this.getNodePath(range.endContainer),
            endOffset: range.endOffset,
            collapsed: range.collapsed
        };
        
        // Also store the text content around the selection for fallback
        try {
            const startNode = range.startContainer;
            if (startNode.nodeType === Node.TEXT_NODE) {
                selectionState.startText = startNode.textContent;
                selectionState.startOffsetText = range.startOffset;
            }
        } catch (e) {
            console.warn('Could not capture selection text fallback:', e);
        }
        
        return selectionState;
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
                
                // Scroll the selection into view
                const rect = range.getBoundingClientRect();
                if (rect.top < 0 || rect.bottom > window.innerHeight) {
                    range.startContainer.parentElement?.scrollIntoView({ 
                        behavior: 'auto', 
                        block: 'nearest' 
                    });
                }
            }
        } catch (error) {
            console.warn('Could not restore selection, using fallback:', error);
            this.restoreSelectionFallback(selectionState);
        }
    }

    restoreSelectionFallback(selectionState) {
        // Fallback method for when normal selection restoration fails
        if (!selectionState.startText) return;
        
        try {
            // Find the text node with matching content
            const walker = document.createTreeWalker(
                this.editor,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );
            
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent === selectionState.startText) {
                    const range = document.createRange();
                    const offset = Math.min(selectionState.startOffsetText, node.textContent.length);
                    range.setStart(node, offset);
                    range.setEnd(node, offset);
                    
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    break;
                }
            }
        } catch (error) {
            console.warn('Fallback selection restoration also failed:', error);
        }
    }

    getNodeFromPath(path) {
        let node = this.editor;
        for (const index of path) {
            if (node && node.childNodes && node.childNodes.length > index) {
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
            
            // Clear any pending typing saves
            clearTimeout(this.typingTimer);
            
            this.currentIndex--;
            const state = this.history[this.currentIndex];
            
            // Store current content for comparison
            const previousContent = this.editor.innerHTML;
            
            this.editor.innerHTML = state.content;
            this.lastContent = state.content;
            
            // Restore selection after a brief delay to allow DOM update
            setTimeout(() => {
                try {
                    this.restoreSelection(state.selection);
                } catch (error) {
                    console.warn('Error restoring selection during undo:', error);
                }
                this.isTracking = true;
                
                console.log(`Undo performed: ${previousContent} -> ${state.content}`);
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
            
            // Clear any pending typing saves
            clearTimeout(this.typingTimer);
            
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            
            // Store current content for comparison
            const previousContent = this.editor.innerHTML;
            
            this.editor.innerHTML = state.content;
            this.lastContent = state.content;
            
            // Restore selection after a brief delay to allow DOM update
            setTimeout(() => {
                try {
                    this.restoreSelection(state.selection);
                } catch (error) {
                    console.warn('Error restoring selection during redo:', error);
                }
                this.isTracking = true;
                
                console.log(`Redo performed: ${previousContent} -> ${state.content}`);
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
    manualSave(type = 'manual') {
        this.saveState(type);
    }

    // Get history info for debugging
    getHistoryInfo() {
        return {
            size: this.history.length,
            currentIndex: this.currentIndex,
            states: this.history.map((state, index) => ({
                index,
                type: state.type,
                timestamp: new Date(state.timestamp).toISOString(),
                contentLength: state.content.length,
                isCurrent: index === this.currentIndex
            }))
        };
    }

    // Cleanup method
    destroy() {
        clearTimeout(this.typingTimer);
        // Remove event listeners if needed
    }
}
