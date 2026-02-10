$(document).ready(async function() {
    try {
        // Fetch and parse JSON files
        const jsonFiles = await getJsonFilesFromDirectory();
        
        if (jsonFiles.length === 0) {
            showError('No JSON files found in measurements directory.');
            return;
        }

        // Load all JSON data
        const allData = await loadJsonFiles(jsonFiles);
        
        // Create and display table
        createComparisonTable(allData);
    } catch (error) {
        showError('Failed to load data: ' + error.message);
    }
});

// Fetch directory listing and discover JSON files
async function getJsonFilesFromDirectory() {
    try {
        const response = await fetch('./measurements/');
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = doc.querySelectorAll('a[href$=".json"]');
        
        return Array.from(links)
            .map(link => './measurements/' + link.getAttribute('href'))
            .filter(href => href.endsWith('.json'));
    } catch (error) {
        throw new Error('Cannot access measurements directory');
    }
}

// Load a single JSON file
async function loadJsonFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    return response.json();
}

// Load all JSON files and organize data
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

// Group JSON data: separate nested objects from scalar values
function flattenJson(obj) {
    const grouped = {};
    
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Nested object - create a group
                grouped[key] = { ...value };
            } else {
                // Scalar value - add to root group
                if (!grouped._root) {
                    grouped._root = {};
                }
                grouped._root[key] = value;
            }
        }
    }
    
    return grouped;
}

// Collect all unique groups and their keys across all submissions
function collectAllGroupKeys(allData) {
    const groups = new Set();
    const groupKeys = {};
    
    allData.forEach(item => {
        Object.keys(item.data).forEach(group => {
            groups.add(group);
            
            if (!groupKeys[group]) {
                groupKeys[group] = new Set();
            }
            
            Object.keys(item.data[group]).forEach(key => {
                groupKeys[group].add(key);
            });
        });
    });
    
    const sortedGroups = Array.from(groups).sort();
    const sortedGroupKeys = {};
    
    sortedGroups.forEach(group => {
        sortedGroupKeys[group] = Array.from(groupKeys[group]).sort();
    });
    
    return { sortedGroups, sortedGroupKeys };
}

// Create comparison table using jQuery
function createComparisonTable(allData) {
    const { sortedGroups, sortedGroupKeys } = collectAllGroupKeys(allData);
    const $table = $('<table id="comparisonTable" class="display"></table>');
    
    // Create table header
    const $thead = createTableHeader(sortedGroups, sortedGroupKeys);
    $table.append($thead);
    
    // Create table body
    const $tbody = createTableBody(allData, sortedGroups, sortedGroupKeys);
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

// Create table header with grouped columns
function createTableHeader(sortedGroups, sortedGroupKeys) {
    const $thead = $('<thead>');
    
    // First row: Group names
    const $groupRow = $('<tr>');
    $groupRow.append($('<th rowspan="2" style="border-right: 2px solid rgba(255,255,255,0.3); vertical-align: middle;">').text('Submission'));
    
    sortedGroups.forEach((group, groupIndex) => {
        const colspan = sortedGroupKeys[group].length;
        const isLastGroup = groupIndex === sortedGroups.length - 1;
        const borderStyle = isLastGroup ? '' : 'border-right: 2px solid rgba(255,255,255,0.3);';
        const groupName = group === '_root' ? 'General' : group.replace(/_/g, ' ');
        
        $groupRow.append($('<th>').attr({
            colspan: colspan,
            style: 'text-align: center; ' + borderStyle
        }).text(groupName));
    });
    
    $thead.append($groupRow);
    
    // Second row: Column names
    const $headerRow = $('<tr>');
    
    sortedGroups.forEach((group, groupIndex) => {
        const keys = sortedGroupKeys[group];
        const isLastGroup = groupIndex === sortedGroups.length - 1;
        
        keys.forEach((key, keyIndex) => {
            const isLastInGroup = keyIndex === keys.length - 1;
            const borderStyle = isLastInGroup && !isLastGroup 
                ? 'border-right: 2px solid rgba(255,255,255,0.3);' 
                : '';
            
            $headerRow.append($('<th>').attr('style', borderStyle).text(key.replace(/_/g, ' ')));
        });
    });
    
    $thead.append($headerRow);
    return $thead;
}

// Create table body with data rows
function createTableBody(allData, sortedGroups, sortedGroupKeys) {
    const $tbody = $('<tbody>');
    
    allData.forEach(item => {
        const $row = $('<tr>');
        $row.append($('<td style="border-right: 2px solid #dde1e6;">').text(item.fileName));
        
        sortedGroups.forEach((group, groupIndex) => {
            const keys = sortedGroupKeys[group];
            const isLastGroup = groupIndex === sortedGroups.length - 1;
            
            keys.forEach((key, keyIndex) => {
                const value = item.data[group] && item.data[group][key] !== undefined 
                    ? item.data[group][key] 
                    : '-';
                
                const isLastInGroup = keyIndex === keys.length - 1;
                const borderStyle = isLastInGroup && !isLastGroup 
                    ? 'border-right: 2px solid #dde1e6;' 
                    : '';
                
                $row.append($('<td>').attr('style', borderStyle).text(value));
            });
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
