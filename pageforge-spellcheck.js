// pageforge-spellcheck.js
const SPELLCHECKER_VERSION = '1.2.0'; // Intelligent triggering version

class PageForgeSpellChecker {
    constructor(editor, statusBar) {
        this.editor = editor;
        this.statusBar = statusBar;
        this.isEnabled = true;
        this.currentLocale = 'en-US';
        this.customDictionary = new Set();
        
        // Spellcheck timing control
        this.quickCheckTimeout = null;
        this.comprehensiveCheckTimeout = null;
        this.isChecking = false;
        
        // Selection and state tracking
        this.lastSelection = null;
        this.lastWordCount = 0;
        this.lastCursorPosition = 0;
        this.isCurrentlyTyping = false;
        this.lastKeyPressed = null;
        
        // Performance optimization
        this.checkedWords = new Set();
        this.lastCheckedPosition = 0;
        
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
        
        // Initial spellcheck
        setTimeout(() => this.checkSpelling(), 1000);
        
        console.log('PageForge SpellChecker initialized with intelligent triggering');
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
        // Save selection before any checks
        this.editor.addEventListener('click', () => this.saveSelection());
        this.editor.addEventListener('keydown', (e) => {
            this.saveSelection();
            this.lastKeyPressed = e.key;
            
            // Word completion triggers
            if (this.isWordCompletionKey(e.key)) {
                this.scheduleQuickCheck(100); // Immediate check after word completion
            }
        });

        // Intelligent input handling
        this.editor.addEventListener('input', (e) => {
            if (!this.isEnabled) return;
            
            this.isCurrentlyTyping = true;
            
            // Check for word completion characters
            if (this.isWordCompletionKey(this.lastKeyPressed)) {
                this.scheduleQuickCheck(150); // Very quick check after word completion
            } else {
                // Progressive timeout for continuous typing
                this.scheduleQuickCheck(300);
                this.scheduleComprehensiveCheck(2000);
            }
        });

        // Force checks on explicit user actions
        this.editor.addEventListener('blur', () => {
            this.scheduleQuickCheck(50); // Immediate check when leaving editor
        });

        this.editor.addEventListener('paste', () => {
            setTimeout(() => this.scheduleQuickCheck(100), 100);
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

    isWordCompletionKey(key) {
        // Keys that typically indicate word completion
        return [' ', 'Enter', '.', ',', '!', '?', ';', ':', '"', "'", ')', ']', '}'].includes(key);
    }

    scheduleQuickCheck(delay = 300) {
        clearTimeout(this.quickCheckTimeout);
        this.quickCheckTimeout = setTimeout(() => {
            this.performQuickCheck();
        }, delay);
    }

    scheduleComprehensiveCheck(delay = 2000) {
        clearTimeout(this.comprehensiveCheckTimeout);
        this.comprehensiveCheckTimeout = setTimeout(() => {
            this.performComprehensiveCheck();
        }, delay);
    }

    async performQuickCheck() {
        if (!this.isEnabled || this.isChecking) return;
        
        this.isChecking = true;
        this.isCurrentlyTyping = false;
        
        try {
            this.saveSelection();
            
            // Get current word count and cursor position
            const currentWordCount = this.getWordCount();
            const currentText = this.editor.innerText;
            
            // If we have new words, check only the recent content
            if (currentWordCount > this.lastWordCount || this.hasSubstantialChanges(currentText)) {
                await this.checkRecentContent();
            }
            
            this.lastWordCount = currentWordCount;
        } catch (error) {
            console.error('Quick spellcheck error:', error);
        } finally {
            this.isChecking = false;
            setTimeout(() => this.restoreSelection(), 50);
        }
    }

    async performComprehensiveCheck() {
        if (!this.isEnabled || this.isChecking) return;
        
        this.isChecking = true;
        
        try {
            this.saveSelection();
            await this.checkSpelling(); // Full document check
        } catch (error) {
            console.error('Comprehensive spellcheck error:', error);
        } finally {
            this.isChecking = false;
            setTimeout(() => this.restoreSelection(), 50);
        }
    }

    hasSubstantialChanges(currentText) {
        // Check if there have been significant changes since last check
        const previousText = this.lastCheckedText || '';
        const changeThreshold = 20; // characters
        
        // Simple Levenshtein-like change detection
        const changes = Math.abs(currentText.length - previousText.length);
        this.lastCheckedText = currentText;
        
        return changes > changeThreshold;
    }

    async checkRecentContent() {
        // Optimized: Only check words that haven't been validated recently
        const text = this.editor.innerText;
        const words = this.extractWords(text);
        
        const recentWords = words.filter(wordInfo => 
            !this.checkedWords.has(wordInfo.word.toLowerCase())
        );
        
        for (const wordInfo of recentWords) {
            const { word } = wordInfo;
            
            if (this.shouldSkipWord(word)) continue;
            
            const isCorrect = await this.checkWord(word);
            
            if (!isCorrect) {
                await this.highlightWordSurgical(word, [wordInfo.positions[0]]);
            } else {
                // Cache correctly spelled words
                this.checkedWords.add(word.toLowerCase());
            }
        }
    }

    saveSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && this.editor.contains(selection.anchorNode)) {
            this.lastSelection = {
                anchorNode: selection.anchorNode,
                anchorOffset: selection.anchorOffset,
                focusNode: selection.focusNode,
                focusOffset: selection.focusOffset
            };
        }
    }

    restoreSelection() {
        if (!this.lastSelection) return;
        
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            
            range.setStart(this.lastSelection.anchorNode, this.lastSelection.anchorOffset);
            range.setEnd(this.lastSelection.focusNode, this.lastSelection.focusOffset);
            
            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            // Selection restoration failed, continue silently
        }
    }

    getWordCount() {
        const text = this.editor.innerText.replace('📌', '') || '';
        const words = text.trim().split(/\s+/).filter(Boolean);
        return words.length;
    }

    async checkSpelling() {
        if (!this.isEnabled || this.isChecking) return;
        
        this.isChecking = true;
        
        try {
            this.saveSelection();
            this.clearHighlights();
            this.checkedWords.clear(); // Reset cache for full check

            const text = this.editor.innerText;
            const words = this.extractWords(text);

            for (const wordInfo of words) {
                const { word } = wordInfo;
                
                if (this.shouldSkipWord(word)) continue;
                
                const isCorrect = await this.checkWord(word);
                
                if (!isCorrect) {
                    await this.highlightWordSurgical(word, [wordInfo.positions[0]]);
                } else {
                    this.checkedWords.add(word.toLowerCase());
                }
            }
            
            this.lastWordCount = this.getWordCount();
            this.lastCheckedText = text;
        } catch (error) {
            console.error('Spellcheck error:', error);
        } finally {
            this.isChecking = false;
            setTimeout(() => this.restoreSelection(), 50);
        }
    }

    shouldSkipWord(word) {
        return word.length < 2 || 
               /^\d+$/.test(word) || 
               word.includes("'") ||
               this.customDictionary.has(word.toLowerCase());
    }

    extractWords(text) {
        const words = new Map();
        const wordRegex = /[a-zA-Z]+(?:'[a-zA-Z]{1,3})?/g;
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
        if (this.customDictionary.has(word.toLowerCase())) {
            return true;
        }

        return this.robustSpellCheck(word);
    }

    robustSpellCheck(word) {
        // Comprehensive English dictionary (same as previous version)
        const dictionary = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
            'when', 'where', 'how', 'why', 'who', 'which', 'that', 'this', 'these',
            'those', 'then', 'than', 'thus', 'so', 'such', 'both', 'either', 'neither',
            'all', 'any', 'each', 'every', 'few', 'more', 'most', 'other', 'some',
            'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'too', 'very',
            'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
            'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'mine',
            'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself',
            'herself', 'itself', 'ourselves', 'yourselves', 'themselves',
            'be', 'is', 'am', 'are', 'was', 'were', 'being', 'been', 'have', 'has',
            'had', 'having', 'do', 'does', 'did', 'doing', 'say', 'says', 'said',
            'saying', 'get', 'gets', 'got', 'getting', 'make', 'makes', 'made',
            'making', 'go', 'goes', 'went', 'going', 'know', 'knows', 'knew',
            'knowing', 'take', 'takes', 'took', 'taking', 'see', 'sees', 'saw',
            'seeing', 'come', 'comes', 'came', 'coming', 'think', 'thinks', 'thought',
            'thinking', 'look', 'looks', 'looked', 'looking', 'want', 'wants', 'wanted',
            'wanting', 'give', 'gives', 'gave', 'giving', 'use', 'uses', 'used',
            'using', 'find', 'finds', 'found', 'finding', 'tell', 'tells', 'told',
            'telling', 'ask', 'asks', 'asked', 'asking', 'work', 'works', 'worked',
            'working', 'seem', 'seems', 'seemed', 'seeming', 'feel', 'feels', 'felt',
            'feeling', 'try', 'tries', 'tried', 'trying', 'leave', 'leaves', 'left',
            'leaving', 'call', 'calls', 'called', 'calling',
            'time', 'person', 'year', 'way', 'day', 'thing', 'man', 'world', 'life',
            'hand', 'part', 'child', 'eye', 'woman', 'place', 'work', 'week', 'case',
            'point', 'government', 'company', 'number', 'group', 'problem', 'fact',
            'good', 'new', 'first', 'last', 'long', 'great', 'little', 'own', 'other',
            'old', 'right', 'big', 'high', 'different', 'small', 'large', 'next',
            'early', 'young', 'important', 'few', 'public', 'bad', 'same', 'able',
            'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
            'i\'m', 'you\'re', 'he\'s', 'she\'s', 'it\'s', 'we\'re', 'they\'re',
            'i\'ve', 'you\'ve', 'we\'ve', 'they\'ve', 'i\'ll', 'you\'ll', 'he\'ll',
            'she\'ll', 'it\'ll', 'we\'ll', 'they\'ll', 'isn\'t', 'aren\'t', 'wasn\'t',
            'weren\'t', 'haven\'t', 'hasn\'t', 'hadn\'t', 'don\'t', 'doesn\'t', 'didn\'t',
            'won\'t', 'wouldn\'t', 'shan\'t', 'shouldn\'t', 'can\'t', 'cannot',
            'couldn\'t', 'mustn\'t', 'let\'s', 'that\'s', 'who\'s', 'what\'s', 'here\'s',
            'there\'s', 'when\'s', 'where\'s', 'why\'s', 'how\'s',
            'welcome', 'pageforge', 'document', 'start', 'typing', 'features',
            'toolbar', 'style', 'text', 'bold', 'italic', 'headings', 'work',
            'automatically', 'saved', 'browser', 'local', 'storage', 'toggle',
            'between', 'light', 'dark', 'mode', 'using', 'icon', 'header',
            'hierarchy', 'panel', 'left', 'structure', 'outline', 'updates',
            'heading', 'styles', 'drag', 'drop', 'sections', 'click', 'inside',
            'section', 'dashed', 'line', 'showing', 'scope', 'ide', 'paragraph',
            'belongs', 'child', 'content', 'blockquote', 'useful', 'highlighting',
            'quotes', 'important', 'notes'
        ]);

        if (dictionary.has(word.toLowerCase())) {
            return true;
        }

        // Check for common suffixes
        const commonSuffixes = ['ing', 'ed', 's', 'es', 'ly', 'er', 'est', 'ment', 'ness', 'tion'];
        const baseWord = word.toLowerCase();
        
        for (const suffix of commonSuffixes) {
            if (baseWord.endsWith(suffix)) {
                const base = baseWord.slice(0, -suffix.length);
                if (dictionary.has(base) && base.length > 1) {
                    return true;
                }
            }
        }

        // Check for common prefixes
        const commonPrefixes = ['un', 're', 'pre', 'dis', 'mis'];
        for (const prefix of commonPrefixes) {
            if (baseWord.startsWith(prefix)) {
                const base = baseWord.slice(prefix.length);
                if (dictionary.has(base) && base.length > 1) {
                    return true;
                }
            }
        }

        return false;
    }

    async highlightWordSurgical(word, positions) {
        return new Promise((resolve) => {
            requestAnimationFrame(() => {
                try {
                    const walker = document.createTreeWalker(
                        this.editor,
                        NodeFilter.SHOW_TEXT,
                        {
                            acceptNode: (node) => {
                                if (node.parentNode.classList && node.parentNode.classList.contains('misspelled-word')) {
                                    return NodeFilter.FILTER_REJECT;
                                }
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
                            const parent = textNode.parentNode;
                            
                            if (parent.classList && parent.classList.contains('misspelled-word') && parent.dataset.word === word) {
                                return;
                            }

                            const fragment = document.createDocumentFragment();
                            let lastIndex = 0;

                            matches.forEach(match => {
                                if (match.index > lastIndex) {
                                    fragment.appendChild(
                                        document.createTextNode(text.substring(lastIndex, match.index))
                                    );
                                }

                                const span = document.createElement('span');
                                span.className = 'misspelled-word';
                                span.dataset.word = word.toLowerCase();
                                span.textContent = match[0];
                                fragment.appendChild(span);

                                lastIndex = match.index + match[0].length;
                            });

                            if (lastIndex < text.length) {
                                fragment.appendChild(
                                    document.createTextNode(text.substring(lastIndex))
                                );
                            }

                            parent.replaceChild(fragment, textNode);
                        }
                    });

                    resolve(true);
                } catch (error) {
                    console.error('Error highlighting word:', error);
                    resolve(false);
                }
            });
        });
    }

    clearHighlights() {
        const misspelledWords = this.editor.querySelectorAll('.misspelled-word');
        misspelledWords.forEach(span => {
            const parent = span.parentNode;
            parent.replaceChild(document.createTextNode(span.textContent), span);
            parent.normalize();
        });
    }

    showContextMenu(element, x, y) {
        const word = element.dataset.word;
        this.currentMisspelledWord = { element, word };
        
        const suggestions = this.getSmartSuggestions(word);
        
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
            setTimeout(() => this.scheduleQuickCheck(100), 100);
        });
        this.contextMenu.appendChild(addToDictDiv);
        
        // Position context menu
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        this.contextMenu.classList.add('hidden');
        this.currentMisspelledWord = null;
    }

    getSmartSuggestions(word) {
        const lowercaseWord = word.toLowerCase();
        
        const suggestionMap = {
            'teh': ['the'], 'adn': ['and'], 'taht': ['that'], 'tihs': ['this'],
            'awya': ['away'], 'bcak': ['back'], 'becuase': ['because'], 'cna': ['can'],
            'dont': ['don\'t'], 'esle': ['else'], 'frist': ['first'], 'fomr': ['form'],
            'haev': ['have'], 'htere': ['there'], 'htis': ['this'], 'hwne': ['when'],
            'hwo': ['who'], 'jsut': ['just'], 'knwo': ['know'], 'liek': ['like'],
            'mkae': ['make'], 'mroe': ['more'], 'peopel': ['people'], 'realy': ['really'],
            'seh': ['she'], 'siad': ['said'], 'tkae': ['take'], 'thna': ['than'],
            'thne': ['then'], 'thsi': ['this'], 'todya': ['today'], 'tought': ['thought'],
            'twpo': ['two'], 'wrod': ['word'], 'wrods': ['words'], 'wroten': ['written'],
            'yera': ['year'], 'yuo': ['you'], 'yuor': ['your'],
            'accomodate': ['accommodate'], 'definately': ['definitely'], 'recieve': ['receive'],
            'seperate': ['separate'], 'occured': ['occurred'], 'neccessary': ['necessary']
        };

        return suggestionMap[lowercaseWord] || [];
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
        
        // Update cache
        this.checkedWords.add(newWord.toLowerCase());
        
        // Quick re-check
        setTimeout(() => this.scheduleQuickCheck(100), 100);
    }

    addToCustomDictionary(word) {
        this.customDictionary.add(word.toLowerCase());
        this.checkedWords.add(word.toLowerCase()); // Also add to cache
        this.saveCustomDictionary();
    }

    removeFromCustomDictionary(word) {
        this.customDictionary.delete(word.toLowerCase());
        this.checkedWords.delete(word.toLowerCase()); // Remove from cache
        this.saveCustomDictionary();
    }

    toggleSpellcheck() {
        this.isEnabled = !this.isEnabled;
        this.updateUI();
        this.saveSettings();
        
        if (this.isEnabled) {
            setTimeout(() => this.scheduleQuickCheck(100), 100);
        } else {
            this.clearHighlights();
        }
        
        return this.isEnabled;
    }

    setLocale(locale) {
        this.currentLocale = locale;
        this.saveSettings();
        
        if (this.isEnabled) {
            setTimeout(() => this.scheduleQuickCheck(100), 100);
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
            this.performComprehensiveCheck();
        }
    }

    // Cleanup method
    destroy() {
        clearTimeout(this.quickCheckTimeout);
        clearTimeout(this.comprehensiveCheckTimeout);
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
