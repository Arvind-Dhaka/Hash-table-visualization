 document.addEventListener('DOMContentLoaded', () => {

            
            const TABLE_SIZE = 10;
            let hashTable;
            let isAnimating = false;

            
            const tableContainer = document.getElementById('hash-table-container');
            const insertBtn = document.getElementById('insert-btn');
            const resetBtn = document.getElementById('reset-btn');
            const valueInput = document.getElementById('value-input');
            const logArea = document.getElementById('log-area');
            const modeRadios = document.querySelectorAll('input[name="mode"]');

           

            /**
             
              @returns {string} 
             */
            function getMode() {
                return document.querySelector('input[name="mode"]:checked').value;
            }

            /**
             
              @param {string} value 
              @returns {number} 
             */
            function hash(value) {
                let total = 0;
                for (let i = 0; i < value.length; i++) {
                    total += value.charCodeAt(i);
                }
                return total % TABLE_SIZE;
            }

            /**
             
              @param {number} ms 
             */
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            /**
              
              @param {string} message 
              @param {string} type 
             */
            function log(message, type = 'info') {
                const p = document.createElement('p');
                p.className = `log-${type}`;
                p.textContent = `> ${message}`;
                logArea.appendChild(p);
                logArea.scrollTop = logArea.scrollHeight; 
            }

            
            function clearHighlights() {
                document.querySelectorAll('.hash-slot').forEach(slot => {
                    slot.classList.remove('highlight-hash', 'highlight-probe', 'highlight-final');
                });
            }

            /**
             
              @param {number} index 
              @param {string} className 
              @param {number} duration 
             */
            async function highlightSlot(index, className, duration = 800) {
                const slot = tableContainer.children[index];
                if (slot) {
                    slot.classList.add(className);
                    await sleep(duration);
                    slot.classList.remove(className);
                }
            }

            

           
            function init() {
                const mode = getMode();
                hashTable = new Array(TABLE_SIZE);
                
                if (mode === 'chaining') {
                    for (let i = 0; i < TABLE_SIZE; i++) {
                        hashTable[i] = []; 
                    }
                } else {
                    hashTable.fill(null); 
                }
                
                logArea.innerHTML = '';
                log(`Initialized table for ${mode} mode. Table size = ${TABLE_SIZE}.`);
                renderTable();
            }

            
            function renderTable() {
                tableContainer.innerHTML = '';
                const mode = getMode();
                tableContainer.className = `mode-${mode}`; 

                for (let i = 0; i < TABLE_SIZE; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'hash-slot';
                    
                    const index = document.createElement('div');
                    index.className = 'slot-index';
                    index.textContent = `Index ${i}`;
                    
                    const content = document.createElement('div');
                    content.className = 'slot-content';
                    content.id = `slot-content-${i}`; 
                    
                    slot.appendChild(index);
                    slot.appendChild(content);
                    tableContainer.appendChild(slot);
                }
            }

           
            async function insertValue() {
                if (isAnimating) return; 
                
                const value = valueInput.value.trim();
                if (!value) {
                    log('Please enter a value.', 'error');
                    return;
                }

                isAnimating = true;
                insertBtn.disabled = true;
                logArea.innerHTML = '';
                clearHighlights();

                const mode = getMode();
                const index = hash(value);

                log(`Hashing "${value}"... hash = ${index}`, 'info');
                await highlightSlot(index, 'highlight-hash', 800);

                if (mode === 'chaining') {
                    await insertChaining(value, index);
                } else {
                    await insertOpenAddressing(value, index);
                }

                valueInput.value = '';
                valueInput.focus();
                isAnimating = false;
                insertBtn.disabled = false;
            }

            /**
            
              @param {string} value 
              @param {number} index 
             */
            async function insertChaining(value, index) {
                if (hashTable[index].includes(value)) {
                    log(`Value "${value}" already exists at index ${index}.`, 'error');
                    return;
                }

                log(`Inserting "${value}" into chain at index ${index}.`, 'success');
                hashTable[index].push(value);

                
                const contentDiv = document.getElementById(`slot-content-${index}`);
                const node = document.createElement('div');
                node.className = 'chain-node';
                node.textContent = value;
                contentDiv.appendChild(node);
                
                await highlightSlot(index, 'highlight-final', 500);
            }

            /**
             
             @param {string} value 
              @param {number} index 
             */
            async function insertOpenAddressing(value, index) {
                let current_index = index;

                for (let i = 0; i < TABLE_SIZE; i++) {
                    current_index = (index + i) % TABLE_SIZE;

                    if (i > 0) { 
                        log(`Probing index ${current_index}...`, 'probe');
                        await highlightSlot(current_index, 'highlight-probe', 800);
                    }

                    if (hashTable[current_index] === null) {
                       
                        log(`Slot ${current_index} is empty. Placing "${value}" here.`, 'success');
                        hashTable[current_index] = value;

                       
                        const contentDiv = document.getElementById(`slot-content-${current_index}`);
                        const node = document.createElement('div');
                        node.className = 'oa-value';
                        node.textContent = value;
                        contentDiv.appendChild(node);

                        await highlightSlot(current_index, 'highlight-final', 500);
                        return; 
                    }

                    if (hashTable[current_index] === value) {
                        log(`Value "${value}" already exists at index ${current_index}.`, 'error');
                        return; 
                    }
                    
                    if (i === 0 && hashTable[current_index] !== null) {
                         log(`Collision at index ${index}! Slot occupied by "${hashTable[index]}".`, 'error');
                         log('Starting linear probing...', 'info');
                    }
                }

               
                log('Hash table is full! Could not insert.', 'error');
            }

            
            insertBtn.addEventListener('click', insertValue);
            resetBtn.addEventListener('click', init);
            
            
            modeRadios.forEach(radio => {
                radio.addEventListener('change', init);
            });

            
            valueInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    insertValue();
                }
            });

           
            init();
        });

