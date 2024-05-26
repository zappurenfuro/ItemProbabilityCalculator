function addChances() {
    const items = document.getElementById('items').value;
    const chancesContainer = document.getElementById('chances-container');
    chancesContainer.innerHTML = '';

    for (let i = 0; i < items; i++) {
        const color = getRandomColor();
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label for="chance${i}">
                Chance for <span class="item-number" style="color: ${color};">item #${i + 1}</span> (in %):
            </label>
            <input type="number" id="chance${i}" step="0.01">
            <div class="input-group custom-name-group" style="display: none;">
                <label for="name${i}">
                    Custom name for <span class="item-number" style="color: ${color};">item #${i + 1}</span>:
                </label>
                <input type="text" id="name${i}">
            </div>
            <div class="input-group minimum-group" style="display: none;">
                <label for="minimum${i}">
                    Minimum items for <span class="item-number" style="color: ${color};">item #${i + 1}</span>:
                </label>
                <input type="number" id="minimum${i}">
            </div>
        `;
        chancesContainer.appendChild(div);
    }

    document.getElementById('calculate-button-container').style.display = 'block';

    // Make sure the custom names and minimum groups are properly displayed
    toggleCustomNames();
    toggleMode();
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function toggleCustomNames() {
    const useCustomNames = document.getElementById('custom-names').checked;
    const customNameGroups = document.querySelectorAll('.custom-name-group');
    customNameGroups.forEach(group => {
        group.style.display = useCustomNames ? 'block' : 'none';
    });
}

function toggleMode() {
    const mode = document.getElementById('mode').value;
    const rollsField = document.getElementById('rolls');
    const minimumGroups = document.querySelectorAll('.minimum-group');

    if (mode === 'rolls') {
        rollsField.parentElement.style.display = 'block';
        minimumGroups.forEach(group => {
            group.style.display = 'none';
        });
    } else if (mode === 'minimums') {
        rollsField.parentElement.style.display = 'none';
        minimumGroups.forEach(group => {
            group.style.display = 'block';
        });
    }
}

function calculate() {
    const items = parseInt(document.getElementById('items').value);
    const mode = document.getElementById('mode').value;
    const chances = [];
    const itemNames = [];

    for (let i = 0; i < items; i++) {
        const chance = parseFloat(document.getElementById(`chance${i}`).value);
        chances.push(chance);
        const useCustomNames = document.getElementById('custom-names').checked;
        const name = useCustomNames ? document.getElementById(`name${i}`).value : `Item #${i + 1}`;
        itemNames.push(name);
    }

    if (mode === 'rolls') {
        const rolls = parseInt(document.getElementById('rolls').value);
        displayResults(items, rolls, chances, itemNames);
    } else if (mode === 'minimums') {
        const minimums = [];
        for (let i = 0; i < items; i++) {
            const minimum = parseInt(document.getElementById(`minimum${i}`).value) || 0;
            minimums.push(minimum);
        }
        const rolls = calculateExactRollsForMinimums(items, chances, minimums);
        displayResults(items, rolls, chances, itemNames);
    }
}

function calculateChances(items, rolls, chances, itemNames) {
    const results = [];
    for (let i = 0; i < items; i++) {
        const itemChance = chances[i];
        const times = (itemChance / 100) * rolls;
        results.push(`${itemNames[i]} (${Math.floor(times)} in ${rolls} tries)`);
    }
    return results;
}

function simulateRolls(items, rolls, chances) {
    const results = new Array(items).fill(0);
    for (let r = 0; r < rolls; r++) {
        const randomValue = Math.random() * 100;
        let cumulativeProbability = 0;
        for (let i = 0; i < items; i++) {
            cumulativeProbability += chances[i];
            if (randomValue < cumulativeProbability) {
                results[i]++;
                break;
            }
        }
    }
    return results;
}

function calculateExpectedRolls(chance) {
    if (chance === 0) {
        return Infinity;
    }
    return Math.ceil(1 / (chance / 100));
}

function calculateExactRollsForMinimums(items, chances, minimums) {
    let rolls = 0;
    for (let i = 0; i < items; i++) {
        if (minimums[i] > 0) {
            const expectedRollsForItem = Math.ceil(minimums[i] / (chances[i] / 100));
            rolls = Math.max(rolls, expectedRollsForItem);
        }
    }
    return rolls;
}

function displayResults(items, rolls, chances, itemNames) {
    const expectedResults = calculateChances(items, rolls, chances, itemNames);
    const simulationResults = simulateRolls(items, rolls, chances);

    let expectedResultsHtml = '<h3>Expected Probability</h3><ul>';
    expectedResults.forEach(result => {
        expectedResultsHtml += `<li>${result}</li>`;
    });
    expectedResultsHtml += '</ul>';

    let simulationResultsHtml = '<h3>Simulation Results</h3><ul>';
    for (let i = 0; i < items; i++) {
        simulationResultsHtml += `<li>${itemNames[i]} (${simulationResults[i]} in ${rolls} tries)</li>`;
    }
    simulationResultsHtml += '</ul>';

    let expectedRollsHtml = '<h3>Expected Rolls</h3><ul>';
    let allItemsRolls = 0;
    for (let i = 0; i < items; i++) {
        const expectedRolls = calculateExpectedRolls(chances[i]);
        allItemsRolls = Math.max(allItemsRolls, expectedRolls);
        expectedRollsHtml += `<li>${itemNames[i]} is expected to be obtained at least once in ${expectedRolls} rolls.</li>`;
    }
    expectedRollsHtml += `</ul><p>${allItemsRolls} rolls is expected to get each of the items at least once.</p>`;

    document.getElementById('expected-results').innerHTML = expectedResultsHtml;
    document.getElementById('simulation-results').innerHTML = simulationResultsHtml;
    document.getElementById('expected-rolls').innerHTML = expectedRollsHtml;

    document.querySelector('.results').style.display = 'block';
}

function exportData() {
    const items = document.getElementById('items').value;
    const rolls = document.getElementById('rolls').value;
    const customNames = document.getElementById('custom-names').checked;
    const mode = document.getElementById('mode').value;
    const chances = [];
    const names = [];
    const minimums = [];

    for (let i = 0; i < items; i++) {
        chances.push(document.getElementById(`chance${i}`).value);
        names.push(document.getElementById(`name${i}`).value);
        minimums.push(document.getElementById(`minimum${i}`).value);
    }

    const data = {
        items,
        rolls,
        customNames,
        mode,
        chances,
        names,
        minimums,
    };

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('file-input').click();
}

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const data = JSON.parse(event.target.result);
        document.getElementById('items').value = data.items;
        document.getElementById('rolls').value = data.rolls;
        document.getElementById('custom-names').checked = data.customNames;
        document.getElementById('mode').value = data.mode;

        addChances();

        for (let i = 0; i < data.items; i++) {
            document.getElementById(`chance${i}`).value = data.chances[i];
            document.getElementById(`name${i}`).value = data.names[i];
            document.getElementById(`minimum${i}`).value = data.minimums[i];
        }

        toggleCustomNames();
        toggleMode();
    };
    reader.readAsText(file);
}
