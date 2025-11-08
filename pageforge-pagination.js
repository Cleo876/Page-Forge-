<!DOCTYPE html>
<html lang="en" class="light">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PageForge</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!-- This will be populated with Google Fonts by JS -->
    <style id="google-fonts-links"></style>
    <style>
        /* Base styles */
        body {
            font-family: 'Inter', sans-serif;
            /* Base light theme */
            background-color: #f3f4f6; /* bg-gray-100 */
            color: #111827; /* text-gray-900 */
        }

        /* Dark theme overrides */
        .dark body {
            background-color: #111827; /* bg-gray-900 */
            color: #f3f4f6; /* text-gray-100 */
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background-color: #e5e7eb; /* bg-gray-200 */
        }
        ::-webkit-scrollbar-thumb {
            background-color: #9ca3af; /* bg-gray-400 */
            border-radius: 9999px; /* rounded-full */
        }
        .dark ::-webkit-scrollbar-track {
            background-color: #374151; /* bg-gray-700 */
        }
        .dark ::-webkit-scrollbar-thumb {
            background-color: #6b7280; /* bg-gray-500 */
        }

        /* Splash Screen */
        #splash-screen {
            transition: opacity 0.5s ease-in-out;
        }
        .splash-content {
            animation: fadeInUp 1s ease-out;
        }
        .splash-logo {
            font-family: 'Inter', sans-serif;
            font-size: 4rem;
            font-weight: 700;
            background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            letter-spacing: 1px;
        }
        .splash-tagline {
            animation: fadeIn 1s ease-out 0.5s forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Main Editor Styling */
        #editor {
            outline: none;
            min-height: 1122px; /* Approx A4 height */
            width: 816px; /* Approx A4 width */
            padding: 96px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            transition: background-color 0.3s, box-shadow 0.3s;
            /* FIX: Using raw CSS properties instead of @apply
              text-sm -> 0.875rem (14px)
              leading-relaxed -> 1.625
            */
            font-size: 0.875rem;
            line-height: 1.625;
        }

        .dark #editor {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* Set styles for content *within* the editor */
        #editor > * {
            transition: color 0.3s;
        }

        #editor h1 {
            /* text-4xl font-bold mt-6 mb-3 border-b pb-2 border-gray-200 */
            font-size: 2.25rem; /* 36px */
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }
        #editor h2 {
            /* text-2xl font-semibold mt-5 mb-2 border-b pb-1 border-gray-200 */
            font-size: 1.5rem; /* 24px */
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 0.25rem;
        }
        #editor h3 {
            /* text-lg font-semibold mt-4 mb-2 */
            font-size: 1.125rem; /* 18px */
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
        }
        #editor p {
            /* mb-4 */
            margin-bottom: 1rem;
        }
        #editor ul {
            /* list-disc list-inside mb-4 pl-4 */
            list-style-type: disc;
            list-style-position: inside;
            margin-bottom: 1rem;
            padding-left: 1rem;
        }
        #editor ol {
            /* list-decimal list-inside mb-4 pl-4 */
            list-style-type: decimal;
            list-style-position: inside;
            margin-bottom: 1rem;
            padding-left: 1rem;
        }
        #editor blockquote {
            /* border-l-4 pl-4 italic my-4 border-gray-300 text-gray-600 */
            border-left: 4px solid #d1d5db;
            padding-left: 1rem;
            font-style: italic;
            margin-top: 1rem;
            margin-bottom: 1rem;
            color: #4b5563;
        }

        /* Dark mode editor content */
        .dark #editor h1, .dark #editor h2 {
            border-color: #374151; /* border-gray-700 */
        }
        .dark #editor blockquote {
            border-color: #4b5563; /* border-gray-600 */
            color: #9ca3af; /* text-gray-400 */
        }

        /* Hierarchy Sidebar */
        #hierarchy-sidebar {
            transition: width 0.3s ease, padding 0.3s ease;
        }
        
        #hierarchy-sidebar.collapsed {
            width: 0px;
            padding-left: 0;
            padding-right: 0;
            overflow: hidden;
        }
        
        /* New Hierarchy Styles */
        #hierarchy-list, #hierarchy-list ul {
            list-style-type: none;
            padding-left: 0;
        }
        #hierarchy-list li {
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
        }
        #hierarchy-list > li {
            padding-left: 0;
        }
        #hierarchy-list ul {
            padding-left: 1rem;
            border-left: 1px solid #e5e7eb; /* border-gray-200 */
            margin-left: 0.5rem;
        }
        .dark #hierarchy-list ul {
            border-color: #374151; /* border-gray-700 */
        }
        .hierarchy-item {
            padding: 0.25rem;
            border-radius: 0.375rem; /* rounded-md */
            font-size: 0.875rem; /* text-sm */
            cursor: pointer;
            color: #374151; /* text-gray-700 */
            border-left: 3px solid transparent;
            transition: background-color 0.2s, border-color 0.2s;
        }
        .hierarchy-item:hover {
            background-color: #e5e7eb; /* bg-gray-200 */
            border-left-color: #4F46E5; /* Brand color */
        }
        .hierarchy-item.dragging {
            opacity: 0.5;
            background-color: #dbeafe; /* bg-blue-100 */
        }
        .hierarchy-item.drop-target {
            box-shadow: 0 0 0 1px #3b82f6; /* ring-1 ring-blue-500 */
        }
        li[data-level="h1"] > .hierarchy-item {
            font-weight: 700; /* font-bold */
            color: #111827; /* text-gray-900 */
        }
        li[data-level="h2"] > .hierarchy-item {
            font-weight: 600; /* font-semibold */
            font-size: 0.875rem; /* text-sm */
        }
        li[data-level="h3"] > .hierarchy-item {
            font-size: 0.75rem; /* text-xs */
        }
        
        /* Dark mode new hierarchy */
        .dark .hierarchy-item {
            color: #d1d5db; /* text-gray-300 */
        }
        .dark .hierarchy-item:hover {
            background-color: #374151; /* bg-gray-700 */
            border-left-color: #7C3AED; /* Lighter brand color for dark */
        }
        .dark .hierarchy-item.dragging {
            background-color: #1e3a8a; /* bg-blue-900 */
        }
        .dark li[data-level="h1"] > .hierarchy-item {
            font-weight: 700;
            color: #f9fafb; /* text-gray-100 */
        }
        .dark li[data-level="h2"] > .hierarchy-item {
            font-weight: 600;
            color: #e5e7eb; /* text-gray-200 */
        }
        .dark li[data-level="h3"] > .hierarchy-item {
            color: #9ca3af; /* text-gray-400 */
        }

        /* Toolbar button styling */
        .toolbar-btn {
            padding: 0.5rem;
            border-radius: 0.375rem; /* rounded-md */
        }
        .toolbar-btn:hover {
            background-color: #e5e7eb; /* hover:bg-gray-200 */
        }
        .toolbar-btn.active {
            background-color: #dbeafe; /* bg-blue-100 */
            color: #1d4ed8; /* text-blue-700 */
        }
        
        .dark .toolbar-btn {
            /* No hover styles needed for base */
        }
        .dark .toolbar-btn:hover {
            background-color: #374151; /* hover:bg-gray-700 */
        }
        .dark .toolbar-btn.active {
            background-color: #1e3a8a; /* bg-blue-900 */
            color: #93c5fd; /* text-blue-300 */
        }
        
        /* Dropdown Menu */
        .menu-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            text-align: left;
            padding-left: 1rem;
            padding-right: 1rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            font-size: 0.875rem; /* text-sm */
            color: #374151; /* text-gray-700 */
            transition: all 0.2s ease;
        }
        .menu-item:hover {
            background-color: #f3f4f6; /* hover:bg-gray-100 */
        }
        .dark .menu-item {
            color: #e5e7eb; /* text-gray-200 */
        }
        .dark .menu-item:hover {
            background-color: #374151; /* hover:bg-gray-700 */
        }
        
        /* Menu icons */
        .menu-icon {
            width: 1.25rem;
            height: 1.25rem;
            flex-shrink: 0;
        }
        
        /* New: Active section highlighting */
        #editor .section-active {
            /* Dashed line, 15% opacity brand color */
            border-left: 2px dashed rgba(79, 70, 229, 0.15);
        }
        .dark #editor .section-active {
             /* Lighter dash for dark mode, 20% opacity */
            border-left-color: rgba(129, 140, 248, 0.2);
        }
        
        /* New Pin Styling */
        #section-pin {
            position: absolute;
            left: -32px; /* Position left of the dashed line */
            bottom: 2px;
            font-size: 1.25rem; /* 20px */
            cursor: ns-resize; /* North-south resize cursor */
            user-select: none; /* Prevent text selection */
            opacity: 0.5;
            transition: opacity 0.2s;
            z-index: 10; /* Ensure pin is clickable */
        }
        #section-pin:hover {
            opacity: 1;
        }
        #section-pin.dragging {
            opacity: 1;
            transform: scale(1.2);
        }
        
        /* Elements need to be relative for pin to be absolute */
        #editor > * {
            position: relative;
        }
        
        /* Custom icons for toolbar */
        .custom-icon {
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 0.8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
        }
        
        .custom-icon.small {
            font-size: 8px;
        }
        
    </style>
    <script>
        // Tailwind dark mode configuration
        tailwind.config = {
            darkMode: 'class', // 'class' enables manual dark mode toggling
        }
    </script>
    <!-- Add this to your main HTML file -->
    <script>
        // Load pagination module
        const PAGINATION_MODULE_URL = 'https://raw.githubusercontent.com/Cleo876/Page-Forge-/refs/heads/main/pageforge-pagination.js';
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
</head>
<body class="flex flex-col h-screen overflow-hidden">

    <!-- Splash Screen -->
    <div id="splash-screen" class="fixed inset-0 flex flex-col justify-center items-center z-50 bg-gray-100 dark:bg-gray-900">
        <div class="splash-content text-center">
            <div class="text-5xl font-bold mb-4" style="color: #7C3AED;">✎</div>
            <div class="splash-logo">[PageForge]</div>
            <div id="splash-tagline" class="splash-tagline text-xl text-gray-500 dark:text-gray-400 opacity-0 mt-2">Your ideas, forged in pages.</div>
        </div>
    </div>

    <!-- Main Application Container -->
    <div id="app-container" class="flex flex-col h-full opacity-0 transition-opacity duration-500">
        
        <!-- Header / Menu Bar -->
        <header class="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-white dark:bg-gray-800 shadow-sm z-20">
            <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                    <span class="text-2xl" style="color: #7C3AED;">✎</span>
                    <span class="text-xl font-bold text-gray-800 dark:text-gray-200">PageForge</span>
                </div>
                <!-- File Menu -->
                <div class="relative" data-menu>
                    <button class="menu-btn px-3 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">File</button>
                    <div class="menu-dropdown hidden absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                        <button id="file-new" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                            </svg>
                            <span>New Document</span>
                        </button>
                        <button id="file-save" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                            </svg>
                            <span>Save (Local)</span>
                        </button>
                        <hr class="my-1 border-gray-200 dark:border-gray-700">
                        <button id="file-upload-forge" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                            </svg>
                            <span>Open .forge File...</span>
                        </button>
                        <hr class="my-1 border-gray-200 dark:border-gray-700">
                        <button id="file-download-forge" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download as .forge</span>
                        </button>
                        <button id="file-download-rtf" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download for <b>Word</b> .rtf</span>
                        </button>
                        <button id="file-download-html" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download as .html</span>
                        </button>
                        <button id="file-download-txt" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Download as .txt</span>
                        </button>
                        <hr class="my-1 border-gray-200 dark:border-gray-700">
                        <button id="file-print" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                            </svg>
                            <span>Print</span>
                        </button>
                    </div>
                </div>
                <!-- Edit Menu -->
                <div class="relative" data-menu>
                    <button class="menu-btn px-3 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Edit</button>
                    <div class="menu-dropdown hidden absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                        <button class="menu-item" data-command="undo">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Undo</span>
                        </button>
                        <button class="menu-item" data-command="redo">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Redo</span>
                        </button>
                        <hr class="my-1 border-gray-200 dark:border-gray-700">
                        <button class="menu-item" data-command="cut">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Cut</span>
                        </button>
                        <button class="menu-item" data-command="copy">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                            </svg>
                            <span>Copy</span>
                        </button>
                        <button class="menu-item" data-command="paste">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            <span>Paste</span>
                        </button>
                    </div>
                </div>
                 <!-- View Menu -->
                <div class="relative" data-menu>
                    <button class="menu-btn px-3 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">View</button>
                    <div class="menu-dropdown hidden absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                        <button id="toggle-hierarchy" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                            <span>Toggle Hierarchy Panel</span>
                        </button>
                    </div>
                </div>
                <!-- Tools Menu -->
                <div class="relative" data-menu>
                    <button class="menu-btn px-3 py-1 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Tools</button>
                    <div class="menu-dropdown hidden absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-30">
                        <button id="manage-fonts" class="menu-item">
                            <svg class="menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path>
                            </svg>
                            <span>Manage Google Fonts</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <input id="document-title" type="text" value="Untitled Document" class="flex-grow max-w-xs text-center text-sm font-semibold bg-transparent rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white">

            <div class="flex items-center gap-4">
                <button id="theme-toggle" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle dark mode">
                    <!-- Icon will be set by JS -->
                    <svg id="theme-icon-light" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <svg id="theme-icon-dark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                </button>
            </div>
        </header>

        <!-- Toolbar -->
        <div class="flex-shrink-0 flex items-center gap-1 px-4 py-2 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 z-10 overflow-x-auto">
            <button class="toolbar-btn" data-command="bold" title="Bold (Ctrl+B)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h5.5a3.5 3.5 0 001.853-6.47l.099-.057A3.5 3.5 0 008.5 4H5zm4.5 2.5a1.5 1.5 0 110 3H7v-3h2.5zm0 5a1.5 1.5 0 110 3H7v-3h2.5z" /></svg>
            </button>
            <button class="toolbar-btn" data-command="italic" title="Italic (Ctrl+I)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.25 4.75a.75.75 0 00-1.5 0v1.5h-.75a.75.75 0 000 1.5h.75v4.5h-.75a.75.75 0 000 1.5h.75v1.5a.75.75 0 001.5 0v-1.5h3.5v1.5a.75.75 0 001.5 0v-1.5h.75a.75.75 0 000-1.5h-.75v-4.5h.75a.75.75 0 000-1.5h-.75v-1.5a.75.75 0 00-1.5 0v1.5h-3.5v-1.5z" /></svg>
            </button>
            <button class="toolbar-btn" data-command="underline" title="Underline (Ctrl+U)">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4.75a.75.75 0 00-1.5 0v7.5c0 1.99 1.635 3.62 3.75 3.745V18a.75.75 0 001.5 0v-2.005C11.365 15.87 13 14.24 13 12.25v-7.5a.75.75 0 00-1.5 0v7.5a2.25 2.25 0 01-4.5 0v-7.5zM15 15.75a.75.75 0 001.5 0v-2.5a.75.75 0 00-1.5 0v2.5z" /></svg>
            </button>
            <!-- Updated Strikethrough Button with Correct Icon -->
            <button class="toolbar-btn" data-command="strikeThrough" title="Strikethrough">
                <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; text-decoration: line-through; line-height: 1;">
                    abc
                </div>
            </button>
            <div class="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <select id="format-block" class="toolbar-btn text-sm p-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" style="-webkit-appearance: none; -moz-appearance: none; appearance: none;">
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="blockquote">Blockquote</option>
            </select>
            <div class="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <select id="font-name" class="toolbar-btn text-sm p-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500" style="-webkit-appearance: none; -moz-appearance: none; appearance: none;">
                <optgroup label="System">
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                </optgroup>
                <optgroup label="Google Fonts" id="google-fonts-options">
                    <!-- Populated by JS -->
                </optgroup>
            </select>
            <div class="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <!-- Updated Bulleted List Button with custom icon -->
            <button class="toolbar-btn" data-command="insertUnorderedList" title="Bulleted List">
                <div class="custom-icon small">
                    <div>🞗</div>
                    <div>🞗</div>
                    <div>🞗</div>
                </div>
            </button>
            <!-- Updated Numbered List Button with custom icon -->
            <button class="toolbar-btn" data-command="insertOrderedList" title="Numbered List">
                <div class="custom-icon small">
                    <div>─ 1</div>
                    <div>─ 2</div>
                    <div>─ 3</div>
                </div>
            </button>
            <div class="h-5 w-px bg-gray-300 dark:bg-gray-600 mx-2"></div>
            <!-- Updated Left Alignment Button -->
            <button class="toolbar-btn" data-command="justifyLeft" title="Align Left">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 4.5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zM2 9.5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zM2 14.5a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5z"/>
                </svg>
            </button>
            <!-- Updated Center Alignment Button -->
            <button class="toolbar-btn" data-command="justifyCenter" title="Align Center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 4.5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zM4 9.5a.5.5 0 01.5-.5h11a.5.5 0 010 1h-11a.5.5 0 01-.5-.5zM6 14.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5z"/>
                </svg>
            </button>
            <!-- Updated Right Alignment Button -->
            <button class="toolbar-btn" data-command="justifyRight" title="Align Right">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 4.5a.5.5 0 01.5-.5h15a.5.5 0 010 1h-15a.5.5 0 01-.5-.5zM7 9.5a.5.5 0 01.5-.5h10a.5.5 0 010 1h-10a.5.5 0 01-.5-.5zM12 14.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z"/>
                </svg>
            </button>
        </div>

        <!-- Main Content Area -->
        <main class="flex-grow flex h-full overflow-hidden">
            
            <!-- Hierarchy Sidebar -->
            <aside id="hierarchy-sidebar" class="flex-shrink-0 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">Hierarchy</h2>
                    <button id="sidebar-collapse-btn" class="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700" title="Collapse sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                    </button>
                </div>
                <ul id="hierarchy-list" class="space-y-1">
                    <!-- Hierarchy items will be populated by JS -->
                </ul>
            </aside>
            <button id="sidebar-expand-btn" class="hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 p-1 rounded-md bg-white dark:bg-gray-800 shadow border border-gray-200 dark:border-gray-700" title="Expand sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
            </button>

            <!-- Editor Container -->
            <div class="flex-grow h-full overflow-y-auto bg-gray-100 dark:bg-gray-900 flex justify-center py-8">
                <div id="editor-wrapper" class="w-full max-w-4xl">
                    <div id="editor"
                         contenteditable="true"
                         spellcheck="true"
                         class="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                        <!-- Default Content -->
                <h1>Welcome to PageForge!</h1>
                <p>This is your new document. Start typing here.</p>
                <h2>Features</h2>
                <p>Here are some of the things you can do:</p>
                <ul>
                    <li>Use the toolbar above to style your text (Bold, Italic, Headings, etc.).</li>
                    <li>Your work is automatically saved to your browser's local storage.</li>
                    <li>Toggle between light and dark mode using the icon in the header.</li>
                    <li>Use the "Hierarchy" panel on the left to see your document structure.</li>
                </ul>
                <h3>Outline Panel</h3>
                <p>The hierarchy panel automatically updates as you add <b>Heading 1</b>, <b>Heading 2</b>, or <b>Heading 3</b> styles. You can even <b>drag and drop</b> sections in the outline to re-order your document!</p>
                <p><b>NEW:</b> Click inside this section. You'll see a dashed line on the left, showing you the "scope" of this header, just like in an IDE!</p>
                <h2>A Second H2</h2>
                <p>This paragraph belongs to the second H2 section.</p>
                <h3>A child H3</h3>
                <p>This content is part of the H3, which is part of the second H2.</p>
                <blockquote>This is a blockquote. It's useful for highlighting quotes or important notes.</blockquote>
            </div>
                </div>
            </div>

        </main>

        <!-- Footer / Status Bar -->
        <footer class="flex-shrink-0 flex justify-between items-center px-4 py-1 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 z-10">
            <div id="status-bar" class="text-green-600 dark:text-green-400">All changes saved locally.</div>
            <div id="word-count">Word Count: 0</div>
        </footer>
    </div>
    
    <!-- Hidden file input for opening .forge files -->
    <input type="file" id="forge-file-input" class="hidden" accept=".forge,application/json">

    <!-- Modals -->
    <!-- Font Management Modal -->
    <div id="font-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Manage Google Fonts</h3>
                <button id="font-modal-close" class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">&times;</button>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">Add or remove Google Fonts. Note: This only loads fonts from <a href="https://fonts.google.com/" target="_blank" class="text-blue-500 underline">fonts.google.com</a>.</p>
            <div class="mb-4">
                <label for="font-add-input" class="block text-sm font-medium mb-1">Add Google Font Name:</label>
                <div class="flex gap-2">
                    <input type="text" id="font-add-input" placeholder="e.g., Roboto" class="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <button id="font-add-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add</button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Just type the font name (e.g., "Lato", "Open Sans").</p>
            </div>
            <hr class="my-4 border-gray-200 dark:border-gray-700">
            <h4 class="text-md font-semibold mb-2">Loaded Fonts</h4>
            <div id="loaded-fonts-list" class="space-y-2 max-h-48 overflow-y-auto">
                <!-- Loaded fonts list -->
            </div>
            <p class="text-xs text-gray-500 mt-4">Note: Accessing all local system fonts is not supported by browsers for security reasons. Only common web-safe fonts are listed by default.</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            
            // === DOM Element Cache ===
            const $ = (selector) => document.querySelector(selector);
            const $$ = (selector) => document.querySelectorAll(selector);

            const editor = $('#editor');
            const editorWrapper = $('#editor-wrapper');
            const statusBar = $('#status-bar');
            const wordCountEl = $('#word-count');
            const docTitleEl = $('#document-title');
            const themeToggle = $('#theme-toggle');
            const themeIconLight = $('#theme-icon-light');
            const themeIconDark = $('#theme-icon-dark');
            const splashScreen = $('#splash-screen');
            const appContainer = $('#app-container');
            const hierarchySidebar = $('#hierarchy-sidebar');
            const hierarchyList = $('#hierarchy-list');
            const sidebarCollapseBtn = $('#sidebar-collapse-btn');
            const sidebarExpandBtn = $('#sidebar-expand-btn');
            const formatBlockSelect = $('#format-block');
            const fontNameSelect = $('#font-name');
            const googleFontsOptions = $('#google-fonts-options');
            const googleFontsLinks = $('#google-fonts-links');
            
            // Modals
            const fontModal = $('#font-modal');
            const fontModalClose = $('#font-modal-close');
            const manageFontsBtn = $('#manage-fonts');
            const fontAddInput = $('#font-add-input');
            const fontAddBtn = $('#font-add-btn');
            const loadedFontsList = $('#loaded-fonts-list');
            
            // New Pin Element
            let pinElement; // Will be created by JS
            let isPinDragging = false;
            let draggedPinInfo = {};

            let saveTimeout = null;
            let currentDraggedSection = null;
            
            // === State ===
            let googleFonts = [];
            let isSidebarCollapsed = false;
            let converter = null; // Our new converter module
            
            // --- CONSTANTS ---
            // !! REPLACE WITH YOUR GITHUB RAW URL !!
            const CONVERTER_MODULE_URL = 'https://raw.githubusercontent.com/Cleo876/Page-Forge-/refs/heads/main/forge-converter.js';
            const CONVERTER_STORAGE_KEY = 'pageforge-converter-module';

            // === Initializers ===

            /**
             * Main initialization function
             */
            function init() {
                // Show splash screen, then fade out and show app
                setTimeout(() => {
                    splashScreen.style.opacity = '0';
                    splashScreen.addEventListener('transitionend', () => {
                        splashScreen.classList.add('hidden');
                        appContainer.style.opacity = '1';
                    }, { once: true });
                }, 1500);
                
                initTheme();
                initMenus();
                initToolbar();
                initEditor();
                initSidebar();
                initModals();
                initFonts();
                initPin(); // New initializer
                initConverter(); // New initializer
                
                updateHierarchy();
                updateWordCount();
                updateActiveButtons();
            }

            /**
             * Initializes the light/dark theme based on localStorage
             */
            function initTheme() {
                const savedTheme = localStorage.getItem('pageforge-theme') || 'light';
                if (savedTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                    themeIconLight.classList.add('hidden');
                    themeIconDark.classList.remove('hidden');
                } else {
                    document.documentElement.classList.remove('dark');
                    themeIconLight.classList.remove('hidden');
                    themeIconDark.classList.add('hidden');
                }
                
                themeToggle.addEventListener('click', () => {
                    const isDark = document.documentElement.classList.toggle('dark');
                    localStorage.setItem('pageforge-theme', isDark ? 'dark' : 'light');
                    themeIconLight.classList.toggle('hidden', isDark);
                    themeIconDark.classList.toggle('hidden', !isDark);
                });
            }

            /**
             * Initializes all dropdown menus in the header
             */
            function initMenus() {
                document.addEventListener('click', (e) => {
                    // Close all menus if clicking outside
                    if (!e.target.closest('[data-menu]')) {
                        $$('.menu-dropdown').forEach(menu => menu.classList.add('hidden'));
                    }
                });

                $$('[data-menu]').forEach(menuContainer => {
                    const btn = menuContainer.querySelector('.menu-btn');
                    const dropdown = menuContainer.querySelector('.menu-dropdown');
                    
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        // Close other menus
                        $$('.menu-dropdown').forEach(menu => {
                            if (menu !== dropdown) menu.classList.add('hidden');
                        });
                        // Toggle this one
                        dropdown.classList.toggle('hidden');
                    });
                });
                
                // File Menu Actions
                $('#file-new').addEventListener('click', () => {
                    if (confirm('Are you sure you want to create a new document? All unsaved changes will be lost.')) {
                        editor.innerHTML = '<h1>Start writing...</h1>';
                        docTitleEl.value = 'Untitled Document';
                        localStorage.removeItem('pageforge-content');
                        localStorage.removeItem('pageforge-title');
                        updateHierarchy();
                        updateWordCount();
                        queueSave();
                    }
                });
                
                $('#file-save').addEventListener('click', () => {
                    saveNow();
                    statusBar.textContent = 'Saved!';
                    setTimeout(() => statusBar.textContent = 'All changes saved locally.', 2000);
                });
                
                $('#file-download-html').addEventListener('click', () => {
                    const title = docTitleEl.value || 'document';
                    // Clone editor to avoid modifying the live one
                    const editorClone = editor.cloneNode(true);
                    // Remove pin from clone
                    editorClone.querySelector('#section-pin')?.remove();
                    // Remove active classes from clone
                    editorClone.querySelectorAll('.section-active').forEach(el => el.classList.remove('section-active'));
                    
                    const content = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;}h1,h2,h3{font-weight:600;}blockquote{border-left:4px solid #ccc;padding-left:1rem;font-style:italic;}</style>${googleFontsLinks.innerHTML}</head><body>${editorClone.innerHTML}</body></html>`;
                    downloadFile(`${title}.html`, content, 'text/html');
                });
                
                $('#file-download-txt').addEventListener('click', () => {
                    if (!converter) return alert('Converter module is loading, please try again.');
                    const title = docTitleEl.value || 'document';
                    const content = converter.convertToText(editor.innerHTML);
                    downloadFile(`${title}.txt`, content, 'text/plain');
                });
                
                // New .forge and .rtf downloads
                $('#file-download-forge').addEventListener('click', () => {
                    if (!converter) return alert('Converter module is loading, please try again.');
                    
                    const title = docTitleEl.value || 'document';
                    const settings = {
                        googleFonts: googleFonts,
                        pinnedSections: getPinnedSections()
                    };
                    const content = converter.convertToForge(editor.innerHTML, title, settings);
                    downloadFile(`${title}.forge`, content, 'application/json');
                });
                
                $('#file-download-rtf').addEventListener('click', () => {
                    if (!converter) return alert('Converter module is loading, please try again.');
                    
                    const title = docTitleEl.value || 'document';
                    const content = converter.convertToRtf(editor.innerHTML);
                    downloadFile(`${title}.rtf`, content, 'application/rtf');
                });
                
                // New .forge upload
                const forgeFileInput = $('#forge-file-input');
                $('#file-upload-forge').addEventListener('click', () => {
                    forgeFileInput.click();
                });
                
                forgeFileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const text = event.target.result;
                            const data = JSON.parse(text);
                            
                            if (data.fileFormat !== "PageForge") {
                                throw new Error("Not a valid PageForge file.");
                            }
                            
                            // Hydrate the app
                            docTitleEl.value = data.title || 'Untitled Document';
                            editor.innerHTML = data.content || '<p></p>';
                            
                            // Load fonts
                            if (data.settings && data.settings.googleFonts) {
                                googleFonts = data.settings.googleFonts;
                                localStorage.setItem('pageforge-fonts', JSON.stringify(googleFonts));
                                loadGoogleFonts();
                                updateFontDropdown();
                                updateLoadedFontsList();
                            }
                            
                            // Apply pins (needs to happen *after* innerHTML is set)
                            if (data.settings && data.settings.pinnedSections) {
                                applyPinnedSections(data.settings.pinnedSections);
                            }
                            
                            queueSave();
                            updateHierarchy();
                            updateActiveSection();
                            
                        } catch (err) {
                            alert(`Error loading file: ${err.message}`);
                        }
                    };
                    reader.readAsText(file);
                    e.target.value = null; // Reset input
                });

                $('#file-print').addEventListener('click', () => window.print());
                
                // Edit Menu Actions
                $$('[data-command="undo"], [data-command="redo"], [data-command="cut"], [data-command="copy"], [data-command="paste"]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        execCmd(btn.dataset.command);
                        btn.closest('.menu-dropdown').classList.add('hidden');
                    });
                });
                
                // View Menu
                $('#toggle-hierarchy').addEventListener('click', toggleSidebar);
            }
            
            /**
             * Initializes the main formatting toolbar
             */
            function initToolbar() {
                $$('.toolbar-btn[data-command]').forEach(btn => {
                    btn.addEventListener('click', () => {
                        execCmd(btn.dataset.command);
                        editor.focus();
                    });
                });
                
                formatBlockSelect.addEventListener('change', () => {
                    execCmd('formatBlock', formatBlockSelect.value);
                    editor.focus();
                });
                
                fontNameSelect.addEventListener('change', () => {
                    const fontName = fontNameSelect.value;
                    if (!googleFonts.includes(fontName) && !['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New'].includes(fontName)) {
                        // This must be a new Google Font
                        if (confirm(`Add and load "${fontName}" from Google Fonts?`)) {
                            addGoogleFont(fontName);
                        } else {
                            // Reset select
                            updateActiveButtons();
                            return;
                        }
                    }
                    execCmd('fontName', fontName);
                    editor.focus();
                });
            }
            
            /**
             * Initializes the contenteditable editor and its event listeners
             */
            function initEditor() {
                // Load content from localStorage
                const savedContent = localStorage.getItem('pageforge-content');
                if (savedContent) {
                    editor.innerHTML = savedContent;
                }
                
                const savedTitle = localStorage.getItem('pageforge-title') || 'Untitled Document';
                docTitleEl.value = savedTitle;

                // Save on input
                editor.addEventListener('input', () => {
                    queueSave();
                    updateWordCount();
                });
                
                docTitleEl.addEventListener('input', queueSave);
                
                // Update toolbar state on selection change
                document.addEventListener('selectionchange', () => {
                    if (document.activeElement === editor) {
                        updateActiveButtons();
                        updateActiveSection(); // New call
                    }
                });
                
                // Handle paste as plain text (optional, but good practice)
                editor.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                    execCmd('insertText', text);
                });
                
                // MutationObserver to update hierarchy
                const observer = new MutationObserver((mutations) => {
                    // We only care if nodes were added/removed or character data changed
                    // This is a simple check; could be optimized
                    updateHierarchy();
                });
                
                observer.observe(editor, {
                    childList: true, 
                    subtree: true,
                    characterData: true
                });
            }
            
            /**
             * Initializes the hierarchy sidebar
             */
            function initSidebar() {
                sidebarCollapseBtn.addEventListener('click', toggleSidebar);
                sidebarExpandBtn.addEventListener('click', toggleSidebar);
                
                // Drag and Drop
                hierarchyList.addEventListener('dragstart', (e) => {
                    const item = e.target.closest('.hierarchy-item');
                    if (item) {
                        currentDraggedSection = item;
                        e.dataTransfer.setData('text/plain', item.dataset.id);
                        e.dataTransfer.effectAllowed = 'move';
                        // Use a slight delay to allow the browser to render the drag image
                        setTimeout(() => item.classList.add('dragging'), 0);
                    }
                });

                hierarchyList.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    const targetLi = e.target.closest('.hierarchy-item');
                    if (targetLi && targetLi !== currentDraggedSection) {
                        // Clear previous targets
                        $$('.hierarchy-item.drop-target').forEach(li => li.classList.remove('drop-target'));
                        targetLi.classList.add('drop-target');
                    }
                });

                hierarchyList.addEventListener('dragleave', (e) => {
                    const targetLi = e.target.closest('.hierarchy-item');
                    if (targetLi) {
                        targetLi.classList.remove('drop-target');
                        }
                });

                hierarchyList.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (!currentDraggedSection) return;
                    
                    const dropTargetLi = e.target.closest('.hierarchy-item');
                    if (!dropTargetLi || dropTargetLi === currentDraggedSection) return;

                    const draggedId = currentDraggedSection.dataset.id;
                    const targetId = dropTargetLi.dataset.id;
                    
                    // Find the actual DOM nodes in the editor
                    const draggedHeader = $(`#${draggedId}`);
                    const targetHeader = $(`#${targetId}`);

                    if (draggedHeader && targetHeader) {
                        moveSection(draggedHeader, targetHeader);
                    }
                    
                    dropTargetLi.classList.remove('drop-target');
                });
                
                hierarchyList.addEventListener('dragend', () => {
                    if (currentDraggedSection) {
                        currentDraggedSection.classList.remove('dragging');
                    }
                    $$('.hierarchy-item.drop-target').forEach(li => li.classList.remove('drop-target'));
                    currentDraggedSection = null;
                });
            }
            
            /**
             * Initializes modal popups
             */
            function initModals() {
                manageFontsBtn.addEventListener('click', () => fontModal.classList.remove('hidden'));
                fontModalClose.addEventListener('click', () => fontModal.classList.add('hidden'));
                
                fontAddBtn.addEventListener('click', () => {
                    const fontName = fontAddInput.value.trim();
                    if (fontName) {
                        addGoogleFont(fontName);
                        fontAddInput.value = '';
                    }
                });
            }
            
            /**
             * Loads and manages Google Fonts from localStorage
             */
            function initFonts() {
                const savedFonts = JSON.parse(localStorage.getItem('pageforge-fonts') || '["Lato", "Roboto", "Open Sans"]');
                googleFonts = [...new Set(savedFonts)]; // Ensure unique
                loadGoogleFonts();
                updateFontDropdown();
                updateLoadedFontsList();
                localStorage.setItem('pageforge-fonts', JSON.stringify(googleFonts));
            }

            /**
             * NEW: Fetches and loads the converter module
             */
            async function initConverter() {
                try {
                    const storedCode = localStorage.getItem(CONVERTER_STORAGE_KEY);
                    if (storedCode) {
                        console.log('Loading converter from localStorage');
                        loadConverter(storedCode);
                    } else {
                        console.log('Fetching converter from network...');
                        const response = await fetch(CONVERTER_MODULE_URL);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        const codeString = await response.text();
                        localStorage.setItem(CONVERTER_STORAGE_KEY, codeString);
                        loadConverter(codeString);
                    }
                } catch (err) {
                    console.error('Failed to load converter module:', err);
                    statusBar.textContent = 'Error: Could not load converter module.';
                }
            }

            /**
             * NEW: Executes the converter code string
             */
            function loadConverter(codeString) {
                try {
                    // Inject the script
                    const script = document.createElement('script');
                    script.textContent = codeString;
                    document.body.appendChild(script);
                    
                    // Now the class `PageForgeConverter` should exist
                    if (typeof PageForgeConverter !== 'undefined') {
                        converter = new PageForgeConverter();
                        console.log('Converter module successfully initialized.');
                    } else {
                        throw new Error('PageForgeConverter class not found after loading script.');
                    }
                } catch (err) {
                    console.error('Error executing converter code:', err);
                }
            }

            /**
             * NEW: Creates the pin element and adds its drag listeners
             */
            function initPin() {
                pinElement = document.createElement('div');
                pinElement.id = 'section-pin';
                pinElement.textContent = '📌';
                pinElement.className = 'hidden'; // Start hidden
                pinElement.setAttribute('draggable', 'false');
                editor.appendChild(pinElement); // Append to editor, not wrapper

                pinElement.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isPinDragging = true;
                    pinElement.classList.add('dragging');
                    // Store the header associated with the pin's current parent
                    draggedPinInfo.header = getHeaderFor(pinElement.parentElement);
                    document.addEventListener('mousemove', onPinDrag);
                    document.addEventListener('mouseup', onPinDragEnd);
                });
            }

            function onPinDrag(e) {
                if (!isPinDragging) return;
                
                // Find what element the cursor is over
                const targetElement = document.elementFromPoint(e.clientX, e.clientY);
                const block = targetElement ? targetElement.closest('#editor > *') : null;
                
                // Ensure block is valid, not the pin itself, and inside the editor
                if (block && block !== pinElement && block !== pinElement.parentElement && editor.contains(block)) {
                    // Check if block is a valid target (not a header itself, and in the same section)
                    const blockHeader = getHeaderFor(block);
                    if (blockHeader === draggedPinInfo.header && !block.tagName.match(/^H[1-3]$/)) {
                        // Snap the pin to the new block
                        movePinToElement(block);
                    }
                }
            }
            
            function onPinDragEnd(e) {
                if (!isPinDragging) return;
                isPinDragging = false;
                pinElement.classList.remove('dragging');
                document.removeEventListener('mousemove', onPinDrag);
                document.removeEventListener('mouseup', onPinDragEnd);
                
                // Save the new pinned element
                const newPinnedElement = pinElement.parentElement;
                if (draggedPinInfo.header && newPinnedElement && newPinnedElement !== editor) {
                    // Ensure the element has an ID
                    if (!newPinnedElement.id) {
                        newPinnedElement.id = `el-${Date.now()}`;
                    }
                    draggedPinInfo.header.dataset.pinnedEndId = newPinnedElement.id;
                    queueSave();
                }
                draggedPinInfo = {};
            }


            // === Core Logic ===

            /**
             * Executes a document command (e.g., bold, italic)
             * @param {string} cmd - The command to execute
             * @param {string} [val=null] - The value for the command (e.g., font name)
             */
            function execCmd(cmd, val = null) {
                document.execCommand(cmd, false, val);
                updateActiveButtons();
            }

            /**
             * Queues a save to localStorage after a delay
             */
            function queueSave() {
                statusBar.textContent = 'Saving...';
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(saveNow, 1000);
            }

            /**
             * Saves the editor content and title to localStorage
             */
            function saveNow() {
                // BUGFIX: Clean pin element before saving
                if (pinElement.parentElement && pinElement.parentElement !== editor) {
                    pinElement.parentElement.removeChild(pinElement);
                    editor.appendChild(pinElement);
                }
                localStorage.setItem('pageforge-content', editor.innerHTML);
                localStorage.setItem('pageforge-title', docTitleEl.value);
                statusBar.textContent = 'All changes saved locally.';
            }
            
            /**
             * Updates the word count in the footer
             */
            function updateWordCount() {
                const text = editor.innerText.replace('📌', '') || ''; // Exclude pin from count
                const words = text.trim().split(/\s+/).filter(Boolean);
                wordCountEl.textContent = `Word Count: ${words.length}`;
            }

            /**
             * Updates the active state of toolbar buttons based on selection
             */
            function updateActiveButtons() {
                $$('.toolbar-btn[data-command]').forEach(btn => {
                    const cmd = btn.dataset.command;
                    if (document.queryCommandState(cmd)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
                
                // Update format block select
                const block = document.queryCommandValue('formatBlock') || 'p';
                formatBlockSelect.value = block;
                
                // FIX: Update font name select using computed style for reliability
                const selection = window.getSelection();
                if (selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
                    let node = selection.anchorNode;
                    let el = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
                    
                    // Handle clicking on the editor wrapper itself
                    if (el === editor) {
                        el = el.firstChild || el;
                    }
                    if (!el || el.nodeType !== Node.ELEMENT_NODE) {
                         // Still not an element, maybe editor is empty
                        return;
                    }

                    const style = window.getComputedStyle(el);
                    const font = style.fontFamily.split(',')[0].replace(/['"]/g, ''); // Get first font in list, clean it
                    
                    // Check if this font exists in our dropdown
                    const exists = Array.from(fontNameSelect.options).some(opt => opt.value === font);
                    if (exists) {
                        fontNameSelect.value = font;
                    } else {
                        // Fallback logic
                        if (font.match(/sans-serif/i)) fontNameSelect.value = "Arial";
                        else if (font.match(/serif/i)) fontNameSelect.value = "Times New Roman";
                        else if (font.match(/monospace/i)) fontNameSelect.value = "Courier New";
                        else fontNameSelect.value = "Arial"; // Default
                    }
                }
            }
            
            /**
             * Highlights the current section in the editor with a dashed border
             */
            function updateActiveSection() {
                // Clear all previous active states
                $$('#editor .section-active').forEach(el => el.classList.remove('section-active'));
                
                // Detach pin from its old parent if it has one
                if (pinElement.parentElement && pinElement.parentElement !== editor) {
                    pinElement.parentElement.removeChild(pinElement);
                    editor.appendChild(pinElement); // Put it back in the editor root
                }
                pinElement.classList.add('hidden');

                const selection = window.getSelection();
                if (!selection.rangeCount || !editor.contains(selection.anchorNode) || isPinDragging) return;

                let node = selection.anchorNode;
                let startNode = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
                let block = startNode.closest('#editor > *');
                
                // BUGFIX: Add check to ensure block is not the pin
                if (!block || block === pinElement) return;

                let header = getHeaderFor(block);
                if (!header) return; // In content, but no header found before it

                // We have the header. Now find the last element of its section.
                const sectionNodes = getSectionNodes(header);
                
                if (sectionNodes.length > 0) {
                    // Add active class to all nodes
                    sectionNodes.forEach(node => node.classList.add('section-active'));
                    
                    // Move and show the pin
                    const lastElement = sectionNodes[sectionNodes.length - 1];
                    movePinToElement(lastElement);
                }
            }
            
            /**
             * Helper to move the pin to a specific element
             */
            function movePinToElement(element) {
                // BUGFIX: Prevent HierarchyRequestError
                if (!element || element === pinElement || pinElement.contains(element)) return;
                
                element.appendChild(pinElement);
                pinElement.classList.remove('hidden');
            }
            
            /**
             * Helper: Gets the H1/H2/H3 header for a given block element
             */
            function getHeaderFor(block) {
                // BUGFIX: Add check
                if (!block || !editor.contains(block) || block === pinElement) return null;
                
                if (block.tagName.match(/^H[1-3]$/)) {
                    return block; // It *is* the header
                }
                
                // It's content, find the header *before* it
                let prev = block.previousElementSibling;
                while (prev) {
                    // BUGFIX: Add check
                    if (prev === pinElement) {
                        prev = prev.previousElementSibling;
                        continue;
                    }
                    if (prev.tagName.match(/^H[1-3]$/)) {
                        return prev; // Found it
                    }
                    prev = prev.previousElementSibling;
                }
                return null; // No header before this content
            }
            
            /**
             * Helper: Gets all DOM nodes belonging to a header's section
             */
            function getSectionNodes(header) {
                if (!header) return [];
                
                const nodes = [header];
                const headerLevel = parseInt(header.tagName.substring(1));
                
                // Check if a manual end-point is pinned
                const pinnedEndId = header.dataset.pinnedEndId;
                const pinnedEndElement = pinnedEndId ? $(`#${pinnedEndId}`) : null;
                
                let currentNode = header.nextElementSibling;
                
                while (currentNode) {
                    // BUGFIX: Skip the pin element if it's encountered as a sibling
                    if (currentNode === pinElement) {
                        currentNode = currentNode.nextElementSibling;
                        continue;
                    }

                    // Stop if we hit the pinned element
                    if (pinnedEndElement && currentNode === pinnedEndElement) {
                        nodes.push(currentNode);
                        break; // Stop, we found the pinned end
                    }
                    
                    // Stop if we hit the *next* header of the same or higher level
                    if (currentNode.tagName.match(/^H[1-3]$/)) {
                        const nextLevel = parseInt(currentNode.tagName.substring(1));
                        if (nextLevel <= headerLevel) {
                            break; // Stop, we're at the next section
                        }
                    }
                    
                    nodes.push(currentNode);
                    
                    // If we are *not* using a pin, and we're at the last element, stop
                    if (!pinnedEndElement && !currentNode.nextElementSibling) {
                        break;
                    }
                    
                    currentNode = currentNode.nextElementSibling;
                }
                return nodes;
            }

            /**
             * NEW: Helper to get all pinned sections for saving
             */
            function getPinnedSections() {
                const pins = {};
                $$('#editor [data-pinned-end-id]').forEach(header => {
                    pins[header.id] = header.dataset.pinnedEndId;
                });
                return pins;
            }
            
            /**
             * NEW: Helper to apply pinned sections after loading
             */
            function applyPinnedSections(pins) {
                if (!pins) return;
                for (const headerId in pins) {
                    const header = $(`#${headerId}`);
                    const pinnedElement = $(`#${pins[headerId]}`);
                    if (header && pinnedElement) {
                        header.dataset.pinnedEndId = pins[headerId];
                    }
                }
            }

            /**
             * Toggles the hierarchy sidebar
             */
            function toggleSidebar() {
                isSidebarCollapsed = !isSidebarCollapsed;
                hierarchySidebar.classList.toggle('collapsed', isSidebarCollapsed);
                sidebarExpandBtn.classList.toggle('hidden', !isSidebarCollapsed);
                sidebarCollapseBtn.classList.toggle('hidden', isSidebarCollapsed);
                
                if(isSidebarCollapsed) {
                    hierarchySidebar.style.width = '0px';
                } else {
                    hierarchySidebar.style.width = '16rem'; // 256px
                }
            }
            
            /**
             * Scans the editor and rebuilds the hierarchy outline
             */
            function updateHierarchy() {
                hierarchyList.innerHTML = '';
                const headers = editor.querySelectorAll('h1, h2, h3');
                
                if (headers.length === 0) {
                    hierarchyList.innerHTML = '<li class="text-gray-400 dark:text-gray-500 text-sm p-2">No hierarchy yet.</li>';
                    return;
                }
                
                // Stack holds { ul: DOMElement, level: number }
                let levelStack = [{ ul: hierarchyList, level: 0 }]; 

                headers.forEach((header, index) => {
                    const id = header.id || `section-${Date.now()}-${index}`;
                    header.id = id;
                    const level = parseInt(header.tagName.substring(1)); // 1, 2, or 3

                    // Pop stack until we find the correct parent
                    while (levelStack[levelStack.length - 1].level >= level) {
                        levelStack.pop();
                    }
                    
                    let parent = levelStack[levelStack.length - 1];

                    // Create the <li>
                    const li = document.createElement('li');
                    li.dataset.level = `h${level}`;

                    // Create the clickable <div>
                    const div = document.createElement('div');
                    div.className = 'hierarchy-item';
                    div.textContent = header.textContent || '[Empty]';
                    div.dataset.id = id;
                    div.setAttribute('draggable', 'true');
                    div.addEventListener('click', () => {
                        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        if (isSidebarCollapsed) toggleSidebar();
                    });
                    li.appendChild(div);

                    // Append the new <li> to its parent <ul>
                    parent.ul.appendChild(li);

                    // If this header can have children, add a new UL and push to stack
                    if (level < 3) {
                        const newUl = document.createElement('ul');
                        li.appendChild(newUl);
                        levelStack.push({ ul: newUl, level: level });
                    }
                });
            }
            
            /**
             * Moves a section (header + content) before another section
             * @param {HTMLElement} draggedHeader - The header of the section to move
             * @param {HTMLElement} targetHeader - The header to move the section before
             */
            function moveSection(draggedHeader, targetHeader) {
                // 1. Create a fragment to hold the section we're moving
                const fragment = document.createDocumentFragment();
                
                // 2. Find all nodes belonging to the dragged section
                const sectionNodes = getSectionNodes(draggedHeader);
                
                // 3. Append all of them to the fragment
                sectionNodes.forEach(node => {
                    fragment.appendChild(node);
                });

                // 4. Insert the fragment before the target header
                editor.insertBefore(fragment, targetHeader);
                
                // 5. Queue a save and let the MutationObserver rebuild the hierarchy
                queueSave();
            }

            // === Font Management Logic ===
            
            function addGoogleFont(fontName) {
                fontName = fontName.trim().split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
                if (!fontName || googleFonts.includes(fontName)) {
                    if (googleFonts.includes(fontName)) {
                        alert('Font is already loaded.');
                    }
                    return;
                }
                googleFonts.push(fontName);
                localStorage.setItem('pageforge-fonts', JSON.stringify(googleFonts));
                loadGoogleFonts();
                updateFontDropdown();
                updateLoadedFontsList();
            }
            
            function removeGoogleFont(fontName) {
                googleFonts = googleFonts.filter(f => f !== fontName);
                localStorage.setItem('pageforge-fonts', JSON.stringify(googleFonts));
                loadGoogleFonts(); // Reloads all fonts *except* the removed one
                updateFontDropdown();
                updateLoadedFontsList();
            }
            
            function loadGoogleFonts() {
                if (googleFonts.length === 0) {
                    googleFontsLinks.innerHTML = '';
                    return;
                }
                const fontQuery = googleFonts.map(f => `family=${f.replace(/ /g, '+')}`).join('&');
                googleFontsLinks.innerHTML = `@import url('https://fonts.googleapis.com/css2?${fontQuery}&display=swap');`;
            }
            
            function updateFontDropdown() {
                googleFontsOptions.innerHTML = '';
                googleFonts.sort().forEach(fontName => {
                    const option = document.createElement('option');
                    option.value = fontName;
                    option.textContent = fontName;
                    option.style.fontFamily = fontName; // Style the option itself
                    googleFontsOptions.appendChild(option);
                });
            }
            
            function updateLoadedFontsList() {
                loadedFontsList.innerHTML = '';
                if (googleFonts.length === 0) {
                    loadedFontsList.innerHTML = '<p class="text-sm text-gray-400">No Google Fonts added.</p>';
                    return;
                }
                googleFonts.forEach(fontName => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md';
                    div.innerHTML = `
                        <span>${fontName}</span>
                        <button data-font="${fontName}" class="font-remove-btn text-red-500 hover:text-red-700 px-2 py-0 rounded-full" title="Remove font">&times;</button>
                    `;
                    loadedFontsList.appendChild(div);
                });
                
                $$('.font-remove-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        removeGoogleFont(btn.dataset.font);
                    });
                });
            }
            
            // === Utility ===
            
            /**
             * Helper to download generated files
             * @param {string} filename - The desired filename
             * @param {string} content - The file content
             * @param {string} mimeType - The MIME type
             */
            function downloadFile(filename, content, mimeType) {
                const blob = new Blob([content], { type: mimeType });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(a.href);
            }

            // Let's go!
            init();
        });
    </script>

</body>
</html>
