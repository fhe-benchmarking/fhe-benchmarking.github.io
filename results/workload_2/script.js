$(document).ready(async function() {
    try {
        // List of JSON files to load
        const jsonFiles = ['./measurements/submission_01.json', './measurements/submission_02.json', './measurements/submission_03.json'];
        
        // Load all JSON data
        const allData = await loadJsonFiles(jsonFiles);
        
        // Create and display table
        createComparisonTable(allData);
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    }
});

// Load a single JSON file
async function loadJsonFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    return response.json();
}

// Load all JSON files and flatten data
async function loadJsonFiles(jsonFiles) {
    const promises = jsonFiles.map(async (file) => {
        try {
            const data = await loadJsonFile(file);
            const fileName = file.split('/').pop().replace('.json', '');
            return { fileName, data: flattenJson(data) };
        } catch (error) {
            console.error('Error loading ' + file + ':', error);
            return null;
        }
    });
    
    const results = await Promise.all(promises);
    return results.filter(item => item !== null);
}

// Flatten nested JSON objects with underscore-separated keys
function flattenJson(obj, prefix = '') {
    const flattened = {};
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? prefix + '_' + key : key;
            const value = obj[key];
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                Object.assign(flattened, flattenJson(value, newKey));
            } else {
                flattened[newKey] = value;
            }
        }
    }
    
    return flattened;
}

// Collect all unique keys across all submissions
function collectAllKeys(allData) {
    const keys = new Set();
    
    allData.forEach(item => {
        Object.keys(item.data).forEach(key => keys.add(key));
    });
    
    return Array.from(keys).sort();
}

// Create comparison table using jQuery
function createComparisonTable(allData) {
    const sortedKeys = collectAllKeys(allData);
    const $table = $('<table id="comparisonTable" class="display"></table>');
    
    // Create table header
    const $thead = createTableHeader(sortedKeys);
    $table.append($thead);
    
    // Create table body
    const $tbody = createTableBody(allData, sortedKeys);
    $table.append($tbody);
    
    // Add table to page
    $('#results').append($table);
    
    // Initialize DataTables
    $('#comparisonTable').DataTable({
        responsive: true,
        pageLength: 10,
        order: [[0, 'asc']]
    });
}

// Create table header
function createTableHeader(sortedKeys) {
    const $thead = $('<thead>');
    const $headerRow = $('<tr>');
    
    $headerRow.append($('<th>').text('Submission'));
    
    sortedKeys.forEach(key => {
        $headerRow.append($('<th>').text(key.replace(/_/g, ' ')));
    });
    
    $thead.append($headerRow);
    return $thead;
}

// Create table body with data rows
function createTableBody(allData, sortedKeys) {
    const $tbody = $('<tbody>');
    
    allData.forEach(item => {
        const $row = $('<tr>');
        $row.append($('<td>').text(item.fileName));
        
        sortedKeys.forEach(key => {
            const value = item.data[key] !== undefined ? item.data[key] : '-';
            $row.append($('<td>').text(value));
        });
        
        $tbody.append($row);
    });
    
    return $tbody;
}

// Display error message
function showError(message) {
    $('#results').html(
        $('<p>').css({
            color: 'red',
            fontWeight: 'bold'
        }).text('Error: ' + message)
    );
}
