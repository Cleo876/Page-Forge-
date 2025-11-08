/**
 * PageForge Converter Module
 * * This file contains all the logic for converting PageForge's
 * HTML content into various downloadable formats.
 * It's designed to be fetched and loaded by the main PageForge app at runtime.
 */

class PageForgeConverter {
    constructor() {
        console.log("PageForge Converter Module Loaded (v1.0)");
    }

    /**
     * Converts the editor's HTML content into the custom .forge (JSON) format.
     * @param {string} html - The innerHTML of the editor.
     * @param {string} title - The document title.
     * @param {object} settings - An object containing fonts, pins, etc.
     * @returns {string} - A JSON string.
     */
    convertToForge(html, title, settings = {}) {
        const forgeData = {
            fileFormat: "PageForge",
            version: "1.0",
            createdAt: new Date().toISOString(),
            title: title,
            content: html,
            settings: {
                googleFonts: settings.googleFonts || [],
                pinnedSections: settings.pinnedSections || {}
            }
        };
        // Pretty-print the JSON
        return JSON.stringify(forgeData, null, 2);
    }

    /**
     * Converts the editor's HTML content into a .txt (plain text) file.
     * @param {string} html - The innerHTML of the editor.
     * @returns {string} - Plain text.
     */
    convertToText(html) {
        // Create a temporary element to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Remove the pin if it's in there
        tempDiv.querySelector('#section-pin')?.remove();
        return tempDiv.innerText || '';
    }

    /**
     * Converts the editor's HTML content into a basic .rtf (Rich Text Format) file.
     * NOTE: This is a very basic implementation. A full HTML-to-RTF
     * converter is extremely complex. This handles basic paragraphs and headers.
     * * @param {string} html - The innerHTML of the editor.
     * @returns {string} - An RTF-formatted string.
     */
    convertToRtf(html) {
        let rtf = '{\\rtf1\\ansi\\deff0\n';
        rtf += '{\\fonttbl {\\f0 Inter;}{\\f1 Arial;}}\n';
        rtf += '\\pard\\sa200\\sl276\\slmult1\\f0\\fs24\n'; // Default paragraph style

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        tempDiv.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                let text = node.innerText || '';
                if (!text.trim()) return;

                // RTF-safe text
                text = text.replace(/\\/g, '\\\\').replace(/{/g, '\\{').replace(/}/g, '\\}');
                text = this.rtfEncode(text);

                switch (node.tagName) {
                    case 'H1':
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\f0\\fs48 ${text}\\par\n`;
                        break;
                    case 'H2':
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\f0\\fs36 ${text}\\par\n`;
                        break;
                    case 'H3':
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\b\\f0\\fs28 ${text}\\par\n`;
                        break;
                    case 'P':
                    case 'DIV':
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\f0\\fs24 ${text}\\par\n`;
                        break;
                    case 'BLOCKQUOTE':
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\i\\f0\\fs24 ${text}\\par\n`;
                        break;
                    case 'UL':
                    case 'OL':
                        node.querySelectorAll('li').forEach(li => {
                            let liText = this.rtfEncode(li.innerText);
                            rtf += `\\pard\\fi-360\\li720\\sa200\\sl276\\slmult1\\f0\\fs24 \\'B7\\tab ${liText}\\par\n`;
                        });
                        break;
                    default:
                        rtf += `\\pard\\sa200\\sl276\\slmult1\\f0\\fs24 ${text}\\par\n`;
                }
            }
        });

        rtf += '}';
        return rtf;
    }

    /**
     * Encodes text for RTF, handling non-ASCII characters.
     */
    rtfEncode(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode <= 127) {
                result += text.charAt(i);
            } else {
                result += `\\u${charCode}\\'3f`; // \'3f is a fallback question mark
            }
        }
        return result.replace(/\n/g, '\\par\n');
    }
}
