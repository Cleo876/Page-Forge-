// pageforge-hierarchy.js
const HIERARCHY_VERSION = '1.0.0';

class PageForgeHierarchy {
    constructor(editor, hierarchyList, statusBar) {
        this.editor = editor;
        this.hierarchyList = hierarchyList;
        this.statusBar = statusBar;
        this.currentDraggedSection = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateHierarchy();
        console.log('PageForge Hierarchy initialized');
    }

    setupEventListeners() {
        // Drag and Drop Event Listeners
        this.hierarchyList.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.hierarchy-item');
            if (item) {
                this.currentDraggedSection = item;
                e.dataTransfer.setData('text/plain', item.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => item.classList.add('dragging'), 0);
            }
        });

        this.hierarchyList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const targetLi = e.target.closest('.hierarchy-item');
            if (targetLi && targetLi !== this.currentDraggedSection) {
                this.clearDropTargets();
                targetLi.classList.add('drop-target');
            }
        });

        this.hierarchyList.addEventListener('dragleave', (e) => {
            const targetLi = e.target.closest('.hierarchy-item');
            if (targetLi) {
                targetLi.classList.remove('drop-target');
            }
        });

        this.hierarchyList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (!this.currentDraggedSection) return;
            
            const dropTargetLi = e.target.closest('.hierarchy-item');
            if (!dropTargetLi || dropTargetLi === this.currentDraggedSection) return;

            const draggedId = this.currentDraggedSection.dataset.id;
            const targetId = dropTargetLi.dataset.id;
            
            // Find the actual DOM nodes in the editor
            const draggedHeader = document.getElementById(draggedId);
            const targetHeader = document.getElementById(targetId);

            if (draggedHeader && targetHeader) {
                this.moveSection(draggedHeader, targetHeader);
            }
            
            dropTargetLi.classList.remove('drop-target');
        });
        
        this.hierarchyList.addEventListener('dragend', () => {
            if (this.currentDraggedSection) {
                this.currentDraggedSection.classList.remove('dragging');
            }
            this.clearDropTargets();
            this.currentDraggedSection = null;
        });
    }

    clearDropTargets() {
        const dropTargets = this.hierarchyList.querySelectorAll('.hierarchy-item.drop-target');
        dropTargets.forEach(li => li.classList.remove('drop-target'));
    }

    updateHierarchy() {
        this.hierarchyList.innerHTML = '';
        const headers = this.editor.querySelectorAll('h1, h2, h3');
        
        if (headers.length === 0) {
            this.hierarchyList.innerHTML = '<li class="text-gray-400 dark:text-gray-500 text-sm p-2">No hierarchy yet.</li>';
            return;
        }
        
        // Stack holds { ul: DOMElement, level: number }
        let levelStack = [{ ul: this.hierarchyList, level: 0 }]; 

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
                // Optional: Toggle sidebar if collapsed
                const sidebar = document.getElementById('hierarchy-sidebar');
                if (sidebar && sidebar.classList.contains('collapsed')) {
                    const toggleBtn = document.getElementById('toggle-hierarchy');
                    if (toggleBtn) toggleBtn.click();
                }
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

    moveSection(draggedHeader, targetHeader) {
        // 1. Get all nodes belonging to the dragged section
        const draggedSectionNodes = this.getSectionNodes(draggedHeader);
        
        // 2. Get all nodes belonging to the target section
        const targetSectionNodes = this.getSectionNodes(targetHeader);
        
        // 3. Create a fragment for the dragged section
        const fragment = document.createDocumentFragment();
        draggedSectionNodes.forEach(node => {
            fragment.appendChild(node);
        });

        // 4. Insert the dragged section before the target section
        // We insert before the first node of the target section (which is the target header)
        this.editor.insertBefore(fragment, targetSectionNodes[0]);
        
        // 5. Update the hierarchy display
        this.updateHierarchy();
        
        // 6. Show feedback
        this.statusBar.textContent = 'Section moved successfully';
        setTimeout(() => {
            this.statusBar.textContent = 'All changes saved locally.';
        }, 2000);
        
        // 7. Trigger save
        this.triggerSave();
    }

    getSectionNodes(header) {
        if (!header) return [];
        
        const nodes = [header];
        const headerLevel = parseInt(header.tagName.substring(1));
        
        // Check if a manual end-point is pinned
        const pinnedEndId = header.dataset.pinnedEndId;
        const pinnedEndElement = pinnedEndId ? document.getElementById(pinnedEndId) : null;
        
        let currentNode = header.nextElementSibling;
        
        while (currentNode) {
            // Skip the pin element if it's encountered as a sibling
            if (currentNode.id === 'section-pin') {
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

    triggerSave() {
        // Dispatch a custom event or call the main app's save function
        const event = new CustomEvent('hierarchyChange', { 
            detail: { action: 'sectionMoved' } 
        });
        document.dispatchEvent(event);
    }

    // Public method to manually refresh the hierarchy
    refresh() {
        this.updateHierarchy();
    }

    // Cleanup method
    destroy() {
        this.clearDropTargets();
        this.currentDraggedSection = null;
    }
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgeHierarchy;
} else {
    window.PageForgeHierarchy = PageForgeHierarchy;
}
