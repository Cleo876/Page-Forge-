// pageforge-hierarchy.js
const HIERARCHY_VERSION = '1.0.4';

class PageForgeHierarchy {
    constructor(editor, hierarchyList, statusBar) {
        this.editor = editor;
        this.hierarchyList = hierarchyList;
        this.statusBar = statusBar;
        this.currentDraggedSection = null;
        this.currentDraggedPin = null;
        this.isDraggingPin = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateHierarchy();
        this.createPins();
        console.log('PageForge Hierarchy initialized');
    }

    setupEventListeners() {
        // Drag and Drop Event Listeners for hierarchy items
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

        // Pin drag and drop events
        this.editor.addEventListener('mousedown', (e) => {
            const pin = e.target.closest('.section-pin');
            if (pin) {
                e.preventDefault();
                this.startPinDrag(pin, e.clientY);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDraggingPin && this.currentDraggedPin) {
                this.dragPin(e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.isDraggingPin) {
                this.endPinDrag();
            }
        });
    }

    createPins() {
        // Remove existing pins
        const existingPins = this.editor.querySelectorAll('.section-pin');
        existingPins.forEach(pin => pin.remove());

        const headers = this.editor.querySelectorAll('h1, h2, h3');
        
        headers.forEach((header, index) => {
            const id = header.id || `section-${Date.now()}-${index}`;
            header.id = id;

            // Find the end of this section
            const sectionEnd = this.findSectionEnd(header);
            
            if (sectionEnd) {
                this.createPinForSection(header, sectionEnd);
            }
        });
    }

    createPinForSection(header, sectionEnd) {
        const pin = document.createElement('div');
        pin.className = 'section-pin';
        pin.innerHTML = '📍'; // Pin icon
        pin.setAttribute('data-header-id', header.id);
        
        // Style the pin
        Object.assign(pin.style, {
            position: 'absolute',
            right: '10px',
            cursor: 'ns-resize',
            userSelect: 'none',
            zIndex: '1000',
            fontSize: '16px',
            opacity: '0.7',
            transition: 'opacity 0.2s'
        });

        pin.addEventListener('mouseenter', () => {
            pin.style.opacity = '1';
        });

        pin.addEventListener('mouseleave', () => {
            if (!this.isDraggingPin) {
                pin.style.opacity = '0.7';
            }
        });

        // Position the pin
        this.positionPin(pin, sectionEnd);
        
        // Add drag listeners
        pin.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startPinDrag(pin, e.clientY);
        });
        
        // Add to editor
        this.editor.appendChild(pin);
    }

    positionPin(pin, targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const editorRect = this.editor.getBoundingClientRect();
        
        pin.style.top = `${rect.bottom - editorRect.top}px`;
    }

    findSectionEnd(header) {
        const headerLevel = parseInt(header.tagName.substring(1));
        let currentNode = header.nextElementSibling;
        let lastNode = header;

        while (currentNode) {
            // Skip pin elements
            if (currentNode.classList.contains('section-pin')) {
                currentNode = currentNode.nextElementSibling;
                continue;
            }

            // Stop if we hit another header of same or higher level
            if (currentNode.tagName.match(/^H[1-3]$/)) {
                const currentLevel = parseInt(currentNode.tagName.substring(1));
                if (currentLevel <= headerLevel) {
                    break;
                }
            }
            
            lastNode = currentNode;
            currentNode = currentNode.nextElementSibling;
            
            // Stop if we're at the end of the document
            if (!currentNode) {
                break;
            }
        }

        return lastNode;
    }

    startPinDrag(pin, startY) {
        this.isDraggingPin = true;
        this.currentDraggedPin = pin;
        this.dragStartY = startY;
        this.originalPinTop = parseInt(pin.style.top);
        
        pin.style.opacity = '1';
        pin.style.zIndex = '1001';
        
        // Add visual feedback
        document.body.style.cursor = 'ns-resize';
        document.body.style.userSelect = 'none';
        
        document.addEventListener('mousemove', this.onPinDrag.bind(this));
        document.addEventListener('mouseup', this.onPinDragEnd.bind(this));
    }

    onPinDrag(e) {
        if (!this.isDraggingPin || !this.currentDraggedPin) return;

        const deltaY = e.clientY - this.dragStartY;
        const newTop = this.originalPinTop + deltaY;
        
        // Constrain dragging to valid positions
        const headerId = this.currentDraggedPin.getAttribute('data-header-id');
        const header = document.getElementById(headerId);
        
        if (header) {
            const headerRect = header.getBoundingClientRect();
            const editorRect = this.editor.getBoundingClientRect();
            const minTop = headerRect.bottom - editorRect.top + 5; // Can't go above header
            
            // Apply constraints
            this.currentDraggedPin.style.top = `${Math.max(minTop, newTop)}px`;
        }
    }

    onPinDragEnd() {
        if (!this.isDraggingPin || !this.currentDraggedPin) return;

        this.isDraggingPin = false;
        
        // Reset cursor and selection
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        this.currentDraggedPin.style.zIndex = '1000';
        this.currentDraggedPin.style.opacity = '0.7';
        
        // Update the section boundaries based on new pin position
        this.updateSectionBoundary(this.currentDraggedPin);
        
        document.removeEventListener('mousemove', this.onPinDrag.bind(this));
        document.removeEventListener('mouseup', this.onPinDragEnd.bind(this));
        
        this.currentDraggedPin = null;
    }

    updateSectionBoundary(pin) {
        const headerId = pin.getAttribute('data-header-id');
        const header = document.getElementById(headerId);
        
        if (!header) return;

        // Calculate the new end position based on pin position
        const pinRect = pin.getBoundingClientRect();
        const editorRect = this.editor.getBoundingClientRect();
        const pinBottom = pinRect.bottom - editorRect.top;
        
        // Store the pin position for section boundary calculations
        header.dataset.pinnedEndPosition = pinBottom.toString();
        
        // Update status
        this.statusBar.textContent = 'Section boundary updated';
        setTimeout(() => {
            this.statusBar.textContent = 'All changes saved locally.';
        }, 2000);
        
        this.triggerSave();
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

        // Update pins after hierarchy update
        setTimeout(() => this.createPins(), 0);
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
        
        // 5. Update the hierarchy display and pins
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
        
        // Check if a manual end-point is pinned via position
        const pinnedEndPosition = header.dataset.pinnedEndPosition;
        
        let currentNode = header.nextElementSibling;
        
        while (currentNode) {
            // Skip pin elements
            if (currentNode.classList.contains('section-pin')) {
                currentNode = currentNode.nextElementSibling;
                continue;
            }

            // Check if we've reached the manually set pin boundary
            if (pinnedEndPosition) {
                const currentNodeRect = currentNode.getBoundingClientRect();
                const editorRect = this.editor.getBoundingClientRect();
                const currentNodeTop = currentNodeRect.top - editorRect.top;
                
                if (currentNodeTop >= parseInt(pinnedEndPosition)) {
                    break; // Stop, we've reached the pinned boundary
                }
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
            if (!pinnedEndPosition && !currentNode.nextElementSibling) {
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
        this.createPins();
    }

    // Cleanup method
    destroy() {
        this.clearDropTargets();
        this.currentDraggedSection = null;
        this.currentDraggedPin = null;
        this.isDraggingPin = false;
        
        // Remove all pins
        const pins = this.editor.querySelectorAll('.section-pin');
        pins.forEach(pin => pin.remove());
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.onPinDrag.bind(this));
        document.removeEventListener('mouseup', this.onPinDragEnd.bind(this));
    }
}

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PageForgeHierarchy;
} else {
    window.PageForgeHierarchy = PageForgeHierarchy;
}
