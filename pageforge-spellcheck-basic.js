// PageForge Basic Spellcheck Plugin
// A lightweight spellchecker with core dictionary
class BasicSpellcheckPlugin extends BaseSpellcheckPlugin {
    constructor(editor, statusBar) {
        super(editor, statusBar);
        this.name = 'Basic Spellcheck';
        this.version = '1.0.0';
        this.isEnabled = false;
        this.dictionary = new Set();
        this.customDictionary = new Set();
        this.locale = 'en-US';
    }

    async init() {
        console.log('Initializing Basic Spellcheck Plugin...');
        await this.loadCoreDictionary();
        this.setupEventListeners();
        this.statusBar.textContent = 'Basic Spellcheck: Ready';
        return true;
    }

    async loadCoreDictionary() {
        // Core dictionary of ~5,000 essential English words
        const coreWords = [
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
            'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
            'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
            'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
            'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
            'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
            'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
            // ... you would expand this to ~5,000 words
            'document', 'write', 'text', 'spell', 'check', 'word', 'page', 'editor'
        ];

        coreWords.forEach(word => this.dictionary.add(word.toLowerCase()));
        
        // Load custom dictionary from localStorage
        const savedCustom = localStorage.getItem('pageforge-custom-dictionary');
        if (savedCustom) {
            const customWords = JSON.parse(savedCustom);
            customWords.forEach(word => this.customDictionary.add(word.toLowerCase()));
        }
    }

    setupEventListeners() {
        // Spellcheck will be triggered manually or on demand
        console.log('Basic spellcheck event listeners setup');
    }

    async checkWord(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!cleanWord) return true;
        
        return this.dictionary.has(cleanWord) || this.customDictionary.has(cleanWord);
    }

    async getSuggestions(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (!cleanWord) return [];
        
        const suggestions = new Set();
        
        // Simple edit distance suggestions
        for (const dictWord of this.dictionary) {
            if (this.calculateEditDistance(cleanWord, dictWord) <= 2) {
                suggestions.add(dictWord);
                if (suggestions.size >= 5) break;
            }
        }
        
        return Array.from(suggestions).slice(0, 5);
    }

    calculateEditDistance(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        const matrix = [];

        // Initialize matrix
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }

        return matrix[b.length][a.length];
    }

    async checkSpelling() {
        if (!this.isEnabled) return;

        // Clear previous spellcheck highlights
        this.clearHighlights();

        const text = this.editor.innerText;
        const words = text.match(/\b[a-zA-Z']+\b/g) || [];

        let misspelledCount = 0;

        for (const word of words) {
            const isCorrect = await this.checkWord(word);
            if (!isCorrect) {
                this.highlightMisspelledWord(word);
                misspelledCount++;
            }
        }

        this.statusBar.textContent = `Spellcheck complete: ${misspelledCount} potential errors found`;
        return misspelledCount;
    }

    highlightMisspelledWord(word) {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const html = this.editor.innerHTML;
        
        this.editor.innerHTML = html.replace(regex, (match) => {
            return `<span class="misspelled-word" data-word="${match}">${match}</span>`;
        });
    }

    clearHighlights() {
        const misspelledElements = this.editor.querySelectorAll('.misspelled-word');
        misspelledElements.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
    }

    toggleEnabled() {
        this.isEnabled = !this.isEnabled;
        
        if (this.isEnabled) {
            this.checkSpelling();
        } else {
            this.clearHighlights();
        }
        
        return this.isEnabled;
    }

    addToCustomDictionary(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (cleanWord) {
            this.customDictionary.add(cleanWord);
            this.saveCustomDictionary();
            
            // Re-check spelling if enabled
            if (this.isEnabled) {
                this.checkSpelling();
            }
        }
    }

    removeFromCustomDictionary(word) {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        this.customDictionary.delete(cleanWord);
        this.saveCustomDictionary();
        
        if (this.isEnabled) {
            this.checkSpelling();
        }
    }

    getCustomDictionary() {
        return Array.from(this.customDictionary);
    }

    saveCustomDictionary() {
        localStorage.setItem('pageforge-custom-dictionary', JSON.stringify(this.getCustomDictionary()));
    }

    setLocale(locale) {
        this.locale = locale;
        // In a real implementation, you might load a different dictionary based on locale
    }

    getSettings() {
        return {
            locale: this.locale,
            customWordsCount: this.customDictionary.size,
            coreWordsCount: this.dictionary.size
        };
    }

    setSettings(settings) {
        if (settings.locale) {
            this.setLocale(settings.locale);
        }
    }

    destroy() {
        this.clearHighlights();
        this.isEnabled = false;
        console.log('Basic Spellcheck Plugin destroyed');
    }
}

// Register with PageForge plugin system
if (typeof PageForgePluginSystem !== 'undefined') {
    PageForgePluginSystem.registerPlugin('Basic Spellcheck', BasicSpellcheckPlugin);
    console.log('Basic Spellcheck Plugin registered with PageForge');
} else {
    console.error('PageForgePluginSystem not found');
}
