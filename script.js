// Premium Flooring Calculator Logic
// Handles room management, calculations, and real-time UI updates

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const roomsContainer = document.getElementById('roomsContainer');
    const addRoomBtn = document.getElementById('addRoomBtn');
    const resetBtn = document.getElementById('resetBtn');
    const calcForm = document.getElementById('calcForm');
    
    // Configurations Elements
    const unitSelect = document.getElementById('unitSelect');
    const priceInput = document.getElementById('priceInput');
    const wastageSelect = document.getElementById('wastageSelect');
    const customWastageGroup = document.getElementById('customWastageGroup');
    const customWastageInput = document.getElementById('customWastageInput');
    
    // Results Elements
    const resTotalMaterial = document.getElementById('resTotalMaterial');
    const resTotalCost = document.getElementById('resTotalCost');
    const resBaseArea = document.getElementById('resBaseArea');
    const resWastagePctText = document.getElementById('resWastagePctText');
    const resWastageAmount = document.getElementById('resWastageAmount');
    const resBaseCost = document.getElementById('resBaseCost');
    const resWastageCost = document.getElementById('resWastageCost');
    const roomBreakdownSection = document.getElementById('roomBreakdownSection');
    const roomBreakdownList = document.getElementById('roomBreakdownList');
    
    // Application State
    let rooms = [];
    let roomCounter = 0;

    // Initialize with a single room
    init();

    function init() {
        roomsContainer.innerHTML = '';
        rooms = [];
        roomCounter = 0;
        addRoom();
        updateUnitLabels();
        calculate();
    }

    // Add a new room input card to the UI
    function addRoom(name = '', length = '', width = '') {
        roomCounter++;
        const roomId = `room-${Date.now()}-${roomCounter}`;
        const defaultName = name || `Room ${roomCounter}`;

        // Create HTML layout for room card
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.id = roomId;
        roomCard.innerHTML = `
            <div class="room-card-header">
                <input type="text" class="room-title" value="${defaultName}" placeholder="Room Name" data-id="${roomId}">
                ${roomCounter > 1 ? `
                    <button type="button" class="btn-delete" data-id="${roomId}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        Delete
                    </button>
                ` : ''}
            </div>
            <div class="room-inputs-grid">
                <div class="form-group">
                    <label>Length</label>
                    <div class="input-wrapper">
                        <input type="number" class="form-control room-length with-suffix" value="${length}" placeholder="0" min="0" step="0.01" required>
                        <span class="suffix val-unit">ft</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Width</label>
                    <div class="input-wrapper">
                        <input type="number" class="form-control room-width with-suffix" value="${width}" placeholder="0" min="0" step="0.01" required>
                        <span class="suffix val-unit">ft</span>
                    </div>
                </div>
            </div>
        `;

        roomsContainer.appendChild(roomCard);
        
        // Save to state
        rooms.push({
            id: roomId,
            name: defaultName,
            length: length ? parseFloat(length) : 0,
            width: width ? parseFloat(width) : 0
        });

        // Event listeners for new inputs to support real-time updates
        const lengthInput = roomCard.querySelector('.room-length');
        const widthInput = roomCard.querySelector('.room-width');
        const titleInput = roomCard.querySelector('.room-title');

        lengthInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            updateRoomData(roomId, 'length', val);
            calculate();
        });

        widthInput.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value) || 0;
            updateRoomData(roomId, 'width', val);
            calculate();
        });

        titleInput.addEventListener('input', (e) => {
            updateRoomData(roomId, 'name', e.target.value || `Room`);
            calculate();
        });

        if (roomCounter > 1) {
            const deleteBtn = roomCard.querySelector('.btn-delete');
            deleteBtn.addEventListener('click', () => {
                deleteRoom(roomId);
            });
        }

        updateUnitLabels();
        calculate();
    }

    // Remove a room
    function deleteRoom(id) {
        const roomElement = document.getElementById(id);
        if (roomElement) {
            // Animating out before removal
            roomElement.style.opacity = '0';
            roomElement.style.transform = 'translateY(12px)';
            roomElement.style.transition = 'all 0.25s ease-out';
            
            setTimeout(() => {
                roomElement.remove();
                rooms = rooms.filter(room => room.id !== id);
                calculate();
            }, 250);
        }
    }

    // Helper to update specific property of a room in array state
    function updateRoomData(id, property, value) {
        const roomIndex = rooms.findIndex(r => r.id === id);
        if (roomIndex !== -1) {
            rooms[roomIndex][property] = value;
        }
    }

    // Handles toggle of custom wastage percentage UI
    wastageSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            customWastageGroup.classList.remove('hidden');
            customWastageInput.setAttribute('required', 'true');
        } else {
            customWastageGroup.classList.add('hidden');
            customWastageInput.removeAttribute('required');
        }
        calculate();
    });

    customWastageInput.addEventListener('input', calculate);
    priceInput.addEventListener('input', calculate);

    // Update labels and re-calculate when unit switches
    unitSelect.addEventListener('change', () => {
        updateUnitLabels();
        calculate();
    });

    // Toggle unit displays (ft vs m)
    function updateUnitLabels() {
        const unit = unitSelect.value;
        const shortUnit = unit === 'feet' ? 'ft' : 'm';
        const areaUnit = unit === 'feet' ? 'Sq. Ft.' : 'Sq. M.';
        
        // Update price per unit text
        document.querySelector('.unit-label').innerText = areaUnit;

        // Update all room measurement unit labels
        const suffixLabels = roomsContainer.querySelectorAll('.val-unit');
        suffixLabels.forEach(label => {
            label.innerText = shortUnit;
        });

        // Update results display units
        const highlightedUnit = document.querySelector('.highlight-unit');
        if (highlightedUnit) {
            highlightedUnit.innerText = areaUnit;
        }
    }

    // Perform main mathematical estimations
    function calculate() {
        const unit = unitSelect.value;
        const areaUnitText = unit === 'feet' ? 'sq. ft' : 'sq. m';
        
        // 1. Calculate Base Area
        let totalBaseArea = 0;
        const roomAreaMap = [];

        rooms.forEach(room => {
            const area = room.length * room.width;
            totalBaseArea += area;
            roomAreaMap.push({
                name: room.name,
                area: area
            });
        });

        // 2. Fetch Wastage Percentage
        let wastagePct = 0;
        if (wastageSelect.value === 'custom') {
            wastagePct = parseFloat(customWastageInput.value) || 0;
        } else {
            wastagePct = parseFloat(wastageSelect.value) || 0;
        }

        // 3. Compute material quantity details
        const wastageAmount = totalBaseArea * (wastagePct / 100);
        const totalMaterialNeeded = totalBaseArea + wastageAmount;

        // 4. Calculate Price if price input exists
        const pricePerUnit = parseFloat(priceInput.value) || 0;
        const baseCost = totalBaseArea * pricePerUnit;
        const wastageCost = wastageAmount * pricePerUnit;
        const totalCost = totalMaterialNeeded * pricePerUnit;

        // 5. Update Results DOM
        resTotalMaterial.innerHTML = `${totalMaterialNeeded.toFixed(2)} <span class="highlight-unit">${unit === 'feet' ? 'Sq. Ft.' : 'Sq. M.'}</span>`;
        resTotalCost.innerText = `$${totalCost.toFixed(2)}`;
        
        resBaseArea.innerText = `${totalBaseArea.toFixed(2)} ${areaUnitText}`;
        resWastagePctText.innerText = wastagePct;
        resWastageAmount.innerText = `${wastageAmount.toFixed(2)} ${areaUnitText}`;
        
        resBaseCost.innerText = `$${baseCost.toFixed(2)}`;
        resWastageCost.innerText = `$${wastageCost.toFixed(2)}`;

        // 6. Update Room Wise breakdown UI if there is more than 1 room
        if (rooms.length > 1 && totalBaseArea > 0) {
            roomBreakdownSection.classList.remove('hidden');
            roomBreakdownList.innerHTML = '';
            roomAreaMap.forEach(room => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="room-breakdown-name">${room.name}</span>
                    <span class="room-breakdown-val">${room.area.toFixed(2)} ${areaUnitText}</span>
                `;
                roomBreakdownList.appendChild(li);
            });
        } else {
            roomBreakdownSection.classList.add('hidden');
        }
    }

    // Setup addition button
    addRoomBtn.addEventListener('click', () => {
        addRoom();
    });

    // Reset Calculator button handler
    resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset all rooms and configuration?")) {
            calcForm.reset();
            customWastageGroup.classList.add('hidden');
            customWastageInput.removeAttribute('required');
            init();
        }
    });

    // Form submit button (also computes final validation just in case)
    calcForm.addEventListener('submit', (e) => {
        e.preventDefault();
        calculate();
        
        // Scroll to results section on mobile for better UX
        if (window.innerWidth <= 900) {
            document.querySelector('.results-section').scrollIntoView({ behavior: 'smooth' });
        }
    });
});
