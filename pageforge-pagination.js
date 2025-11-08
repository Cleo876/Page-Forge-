<!-- Add this to your main HTML file -->
<script>
    // Load pagination module
    const PAGINATION_MODULE_URL = 'https://raw.githubusercontent.com/your-username/your-repo/main/pageforge-pagination.js';
    const PAGINATION_STORAGE_KEY = 'pageforge-pagination-module';

    async function initPaginationModule() {
        try {
            const storedCode = localStorage.getItem(PAGINATION_STORAGE_KEY);
            if (storedCode) {
                loadPaginationModule(storedCode);
            } else {
                const response = await fetch(PAGINATION_MODULE_URL);
                const codeString = await response.text();
                localStorage.setItem(PAGINATION_STORAGE_KEY, codeString);
                loadPaginationModule(codeString);
            }
        } catch (err) {
            console.error('Failed to load pagination module:', err);
        }
    }

    function loadPaginationModule(codeString) {
        const script = document.createElement('script');
        script.textContent = codeString;
        document.body.appendChild(script);
    }

    // Call this in your main init function
    initPaginationModule();
</script>
