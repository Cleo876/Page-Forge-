// pageforge-spellcheck.js
const SPELLCHECKER_VERSION = '1.0.1'; // Bumped version

class PageForgeSpellChecker {
    constructor(editor, statusBar) {
        this.editor = editor;
        this.statusBar = statusBar;
        this.isEnabled = true;
        this.currentLocale = 'en-US';
        this.customDictionary = new Set();
        this.spellcheckTimeout = null;
        this.currentMisspelledWord = null;
        
        // Initialize the system
        this.init();
    }

    async init() {
        // Load settings and custom dictionary
        this.loadSettings();
        this.loadCustomDictionary();
        
        // Set up the editor
        this.editor.setAttribute('spellcheck', 'false');
        this.editor.classList.add('spellcheck-enabled');
        
        // Create context menu
        this.createContextMenu();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUI();
        
        console.log('PageForge SpellChecker initialized');
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('pageforge-spellcheck-settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.isEnabled = settings.enabled !== false;
            this.currentLocale = settings.locale || 'en-US';
        }
    }

    saveSettings() {
        const settings = {
            enabled: this.isEnabled,
            locale: this.currentLocale
        };
        localStorage.setItem('pageforge-spellcheck-settings', JSON.stringify(settings));
    }

    loadCustomDictionary() {
        const savedDict = localStorage.getItem('pageforge-custom-dictionary');
        if (savedDict) {
            this.customDictionary = new Set(JSON.parse(savedDict));
        }
    }

    saveCustomDictionary() {
        localStorage.setItem('pageforge-custom-dictionary', JSON.stringify(Array.from(this.customDictionary)));
    }

    createContextMenu() {
        this.contextMenu = document.createElement('div');
        this.contextMenu.id = 'spellcheck-context-menu';
        this.contextMenu.className = 'hidden fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 min-w-48 max-w-64';
        document.body.appendChild(this.contextMenu);
    }

    setupEventListeners() {
        // Editor input for real-time checking
        this.editor.addEventListener('input', () => {
            if (this.isEnabled) {
                this.debounceSpellcheck();
            }
        });

        // Right-click context menu
        this.editor.addEventListener('contextmenu', (e) => {
            if (!this.isEnabled) return;
            
            const target = e.target;
            if (target.classList.contains('misspelled-word')) {
                e.preventDefault();
                this.showContextMenu(target, e.clientX, e.clientY);
            }
        });

        // Click to hide context menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#spellcheck-context-menu') && !e.target.classList.contains('misspelled-word')) {
                this.hideContextMenu();
            }
        });

        // Keyboard shortcuts
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideContextMenu();
            }
        });
    }

    debounceSpellcheck() {
        clearTimeout(this.spellcheckTimeout);
        this.spellcheckTimeout = setTimeout(() => {
            this.checkSpelling();
        }, 500);
    }

    async checkSpelling() {
        if (!this.isEnabled) return;

        // Clear existing highlights
        this.clearHighlights();

        const text = this.editor.innerText;
        const words = this.extractWords(text);

        for (const wordInfo of words) {
            const { word, positions } = wordInfo;
            
            if (word.length < 2 || /^\d+$/.test(word)) continue;
            
            const isCorrect = await this.checkWord(word);
            
            if (!isCorrect) {
                this.highlightWordSurgical(word, positions);
            }
        }
    }

    extractWords(text) {
        const words = new Map();
        const wordRegex = /[a-zA-Z]+(?:'[a-zA-Z]+)*/g;
        let match;
        
        while ((match = wordRegex.exec(text)) !== null) {
            const word = match[0].toLowerCase();
            if (!words.has(word)) {
                words.set(word, []);
            }
            words.get(word).push(match.index);
        }
        
        return Array.from(words.entries()).map(([word, positions]) => ({
            word,
            positions
        }));
    }

    async checkWord(word) {
        // Check custom dictionary first
        if (this.customDictionary.has(word.toLowerCase())) {
            return true;
        }

        // Simple mock implementation - replace with actual Hunspell logic
        // For now, we'll use a basic dictionary of common words
        return this.mockSpellCheck(word);
    }

    mockSpellCheck(word) {
        // Common English words dictionary
        const commonWords = new Set([
            'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
            'was', 'one', 'our', 'out', 'get', 'has', 'him', 'how', 'man', 'new',
            'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let',
            'put', 'say', 'she', 'too', 'use', 'that', 'with', 'have', 'this',
            'will', 'your', 'from', 'they', 'know', 'want', 'been', 'good', 'much',
            'some', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make',
            'many', 'then', 'well', 'were', 'what', 'where', 'which', 'while',
            'who', 'will', 'with', 'would', 'write', 'year', 'you', 'young', 'your',
            'welcome', 'to', 'pageforge', 'this', 'is', 'your', 'new', 'document', 'start', 'typing', 'here',
            'features', 'here', 'are', 'some', 'of', 'the', 'things', 'you', 'can', 'do',
            'use', 'the', 'toolbar', 'above', 'style', 'your', 'text', 'bold', 'italic', 'headings', 'etc',
            'work', 'automatically', 'saved', 'browser', 'local', 'storage',
            'toggle', 'between', 'light', 'dark', 'mode', 'using', 'icon', 'in', 'header',
            'hierarchy', 'panel', 'on', 'left', 'see', 'structure',
            'outline', 'automatically', 'updates', 'as', 'add', 'heading', 'or', 'styles',
            'even', 'drag', 'drop', 'sections', 're', 'order',
            'new', 'click', 'inside', 'section', 'see', 'dashed', 'line', 'showing', 'scope', 'just', 'like', 'ide',
            'second', 'paragraph', 'belongs', 'child', 'content', 'part', 'blockquote', 'useful', 'highlighting', 'quotes', 'important', 'notes'
        ]);

        return commonWords.has(word.toLowerCase()) || word.length <= 2;
    }

    highlightWordSurgical(word, positions) {
        // Use TreeWalker to find text nodes without destroying HTML structure
        const walker = document.createTreeWalker(
            this.editor,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip text nodes that are already inside misspelled-word spans
                    if (node.parentNode.classList && node.parentNode.classList.contains('misspelled-word')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Skip text nodes in elements we don't want to spellcheck
                    if (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            },
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');

        textNodes.forEach(textNode => {
            const text = textNode.textContent;
            const matches = [...text.matchAll(regex)];
            
            if (matches.length > 0) {
                // We have matches, need to replace this text node
                const parent = textNode.parentNode;
                
                // If parent is already a misspelled word span for this word, skip
                if (parent.classList && parent.classList.contains('misspelled-word') && parent.dataset.word === word) {
                    return;
                }

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                matches.forEach(match => {
                    // Add text before match
                    if (match.index > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(text.substring(lastIndex, match.index))
                        );
                    }

                    // Add highlighted word
                    const span = document.createElement('span');
                    span.className = 'misspelled-word';
                    span.dataset.word = word.toLowerCase();
                    span.textContent = match[0];
                    fragment.appendChild(span);

                    lastIndex = match.index + match[0].length;
                });

                // Add remaining text
                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex))
                    );
                }

                // Replace the original text node
                parent.replaceChild(fragment, textNode);
            }
        });
    }

    clearHighlights() {
        const misspelledWords = this.editor.querySelectorAll('.misspelled-word');
        misspelledWords.forEach(span => {
            const parent = span.parentNode;
            // Replace span with its text content
            parent.replaceChild(document.createTextNode(span.textContent), span);
            // Normalize to merge adjacent text nodes
            parent.normalize();
        });
    }

    showContextMenu(element, x, y) {
        const word = element.dataset.word;
        this.currentMisspelledWord = { element, word };
        
        const suggestions = this.getSuggestions(word);
        
        this.contextMenu.innerHTML = '';
        
        if (suggestions.length > 0) {
            suggestions.slice(0, 5).forEach(suggestion => {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'suggestion px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-600';
                suggestionDiv.textContent = suggestion;
                suggestionDiv.addEventListener('click', () => {
                    this.replaceWord(suggestion);
                    this.hideContextMenu();
                });
                this.contextMenu.appendChild(suggestionDiv);
            });
        } else {
            const noSuggestionDiv = document.createElement('div');
            noSuggestionDiv.className = 'suggestion px-3 py-2 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600';
            noSuggestionDiv.textContent = 'No suggestions';
            this.contextMenu.appendChild(noSuggestionDiv);
        }
        
        const addToDictDiv = document.createElement('div');
        addToDictDiv.className = 'add-to-dictionary px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-medium';
        addToDictDiv.textContent = `Add "${word}" to dictionary`;
        addToDictDiv.addEventListener('click', () => {
            this.addToCustomDictionary(word);
            this.hideContextMenu();
            this.checkSpelling(); // Re-check to remove highlighting
        });
        this.contextMenu.appendChild(addToDictDiv);
        
        // Position and show the context menu
        const rect = this.contextMenu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust position to stay within viewport
        let adjustedX = x;
        let adjustedY = y;
        
        if (x + rect.width > viewportWidth) {
            adjustedX = viewportWidth - rect.width - 10;
        }
        
        if (y + rect.height > viewportHeight) {
            adjustedY = viewportHeight - rect.height - 10;
        }
        
        this.contextMenu.style.left = adjustedX + 'px';
        this.contextMenu.style.top = adjustedY + 'px';
        this.contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.currentMisspelledWord = null;
    }

    getSuggestions(word) {
        // Mock suggestions - replace with Hunspell suggestions
        const suggestionMap = {
            'teh': ['the'],
            'adn': ['and'],
            'recieve': ['receive'],
            'seperate': ['separate'],
            'definately': ['definitely'],
            'occured': ['occurred'],
            'accomodate': ['accommodate'],
            'alot': ['a lot'],
            'becuase': ['because'],
            'neccessary': ['necessary']
        };
        
        return suggestionMap[word.toLowerCase()] || [];
    }

    replaceWord(newWord) {
        if (!this.currentMisspelledWord) return;
        
        const { element } = this.currentMisspelledWord;
        const selection = window.getSelection();
        const range = document.createRange();
        
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
        
        document.execCommand('insertText', false, newWord);
        
        // Re-check spelling after replacement
        setTimeout(() => this.checkSpelling(), 100);
    }

    addToCustomDictionary(word) {
        this.customDictionary.add(word.toLowerCase());
        this.saveCustomDictionary();
    }

    removeFromCustomDictionary(word) {
        this.customDictionary.delete(word.toLowerCase());
        this.saveCustomDictionary();
    }

    toggleSpellcheck() {
        this.isEnabled = !this.isEnabled;
        this.updateUI();
        this.saveSettings();
        
        if (this.isEnabled) {
            this.checkSpelling();
        } else {
            this.clearHighlights();
        }
        
        return this.isEnabled;
    }

    setLocale(locale) {
        this.currentLocale = locale;
        this.saveSettings();
        
        if (this.isEnabled) {
            this.checkSpelling();
        }
    }

    updateUI() {
        if (this.isEnabled) {
            this.editor.classList.add('spellcheck-enabled');
            this.editor.classList.remove('spellcheck-disabled');
        } else {
            this.editor.classList.add('spellcheck-disabled');
            this.editor.classList.remove('spellcheck-enabled');
            this.clearHighlights();
        }
    }

    getCustomDictionary() {
        return Array.from(this.customDictionary).sort();
    }

    // Public method to manually trigger spellcheck
    checkDocument() {
        if (this.isEnabled) {
            this.checkSpelling();
        }
    }

    // Cleanup method
    destroy() {
        clearTimeout(this.spellcheckTimeout);
        if (this.contextMenu && this.contextMenu.parentNode) {
            this.contextMenu.parentNode.removeChild(this.contextMenu);
        }
        this.clearHighlights();
    }
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgeSpellChecker;
} else {
    window.PageForgeSpellChecker = PageForgeSpellChecker;
}
