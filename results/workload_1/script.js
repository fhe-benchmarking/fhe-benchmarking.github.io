$(document).ready(function() {
    // Pattern to match JSON files
    const jsonPattern = /.*\.json$/;
    let jsonFiles = [];
    let allData = [];
    let allKeys = new Set();

    // Method to read all JSON files from measurements directory
    function getJsonFilesFromDirectory() {
        return $.ajax({
            url: './measurements/',
            dataType: 'html',
            success: function(html) {
                // Parse HTML to find JSON file links
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, 'text/html');
                let links = doc.querySelectorAll('a[href$=".json"]');
                
                links.forEach(function(link) {
                    let href = link.getAttribute('href');
                    if (jsonPattern.test(href)) {
                        jsonFiles.push('./measurements/' + href);
                    }
                });

                // If no files found, display error
                if (jsonFiles.length === 0) {
                    $('#results').html('<p style="color: red; font-weight: bold;">Error: No JSON files found in measurements directory.</p>');
                }

                return jsonFiles;
            },
            error: function() {
                // Display error if directory listing fails
                $('#results').html('<p style="color: red; font-weight: bold;">Error: Cannot access measurements directory. Please check that the directory exists and is accessible.</p>');
                return [];
            }
        });
    }

    // Initialize by getting JSON files from directory
    getJsonFilesFromDirectory().done(function() {
        if (jsonFiles.length > 0) {
            loadJsonFiles();
        }
    });

    // Function to flatten nested JSON objects with grouping
    function flattenJson(obj) {
        let grouped = {};
        
        for (let groupKey in obj) {
            if (obj.hasOwnProperty(groupKey)) {
                if (typeof obj[groupKey] === 'object' && obj[groupKey] !== null) {
                    // This is a group
                    grouped[groupKey] = {};
                    for (let key in obj[groupKey]) {
                        if (obj[groupKey].hasOwnProperty(key)) {
                            grouped[groupKey][key] = obj[groupKey][key];
                        }
                    }
                } else {
                    // Top-level scalar value
                    if (!grouped['_root']) {
                        grouped['_root'] = {};
                    }
                    grouped['_root'][groupKey] = obj[groupKey];
                }
            }
        }
        
        console.log('Grouped JSON:', grouped);
        return grouped;
    }

    // Load all JSON files
    function loadJsonFiles() {
        let loadedCount = 0;
        $.each(jsonFiles, function(index, file) {
            $.ajax({
                url: file,
                dataType: 'json',
                success: function(data) {     
                    let flatData = flattenJson(data);
                    allData.push({ file: file, data: flatData });
                    
                    // Collect all groups
                    $.each(flatData, function(group) {
                        allKeys.add(group);
                    });

                    console.log("keys", allKeys);
                    
                    loadedCount++;
                    if (loadedCount === jsonFiles.length) {
                        createComparisonTable();
                    }
                },
                error: function(xhr, status, error) {
                    $('#results').append($('<p>').text('Error loading ' + file + ': ' + error));
                }
            });
        });
    }

    // Create comparison table once all data is loaded
    function createComparisonTable() {
        let $table = $('<table id="comparisonTable" class="display"></table>');
        
        // Sort groups
        let sortedGroups = Array.from(allKeys).sort();
        
        // Collect all unique keys from all groups across all submissions
        let allGroupKeys = {};
        sortedGroups.forEach(function(group) {
            allGroupKeys[group] = new Set();
            allData.forEach(function(item) {
                if (item.data[group]) {
                    Object.keys(item.data[group]).forEach(function(key) {
                        allGroupKeys[group].add(key);
                    });
                }
            });
            allGroupKeys[group] = Array.from(allGroupKeys[group]).sort();
        });
        
        // Create header with group names row and column names row
        let $thead = $('<thead>');
        
        // First row: Group names
        let $groupRow = $('<tr>');
        $groupRow.append($('<th rowspan="2" style="border-right: 2px solid rgba(255,255,255,0.3); vertical-align: middle;">').text('Submission'));
        
        sortedGroups.forEach(function(group, groupIndex) {
            let keys = allGroupKeys[group];
            let colspan = keys.length;
            let isLastGroup = groupIndex === sortedGroups.length - 1;
            let borderStyle = isLastGroup ? '' : 'border-right: 2px solid rgba(255,255,255,0.3);';
            let groupName = group === '_root' ? 'General' : group.replace(/_/g, ' ');
            $groupRow.append($('<th colspan="' + colspan + '" style="text-align: center; ' + borderStyle + '">').text(groupName));
        });
        $thead.append($groupRow);
        
        // Second row: Column names
        let $headerRow = $('<tr>');
        
        sortedGroups.forEach(function(group, groupIndex) {
            let keys = allGroupKeys[group];
            keys.forEach(function(key, keyIndex) {
                let isLastInGroup = keyIndex === keys.length - 1;
                let isLastGroup = groupIndex === sortedGroups.length - 1;
                let borderStyle = isLastInGroup && !isLastGroup 
                    ? 'border-right: 2px solid rgba(255,255,255,0.3);' 
                    : '';
                $headerRow.append($('<th style="' + borderStyle + '">').text(key.replace(/_/g, ' ')));
            });
        });
        $thead.append($headerRow);
        $table.append($thead);

        // Create table body with data rows
        let $tbody = $('<tbody>');
        $.each(allData, function(index, item) {
            let $dataRow = $('<tr>');
            // Extract filename without extension
            let fileName = item.file.split('/').pop().replace('.json', '');
            $dataRow.append($('<td style="border-right: 2px solid #dde1e6;">').text(fileName));
            
            sortedGroups.forEach(function(group, groupIndex) {
                let keys = allGroupKeys[group];
                keys.forEach(function(key, keyIndex) {
                    let value = item.data[group] && item.data[group][key] ? item.data[group][key] : '-';
                    let isLastInGroup = keyIndex === keys.length - 1;
                    let isLastGroup = groupIndex === sortedGroups.length - 1;
                    let borderStyle = isLastInGroup && !isLastGroup 
                        ? 'border-right: 2px solid #dde1e6;' 
                        : '';
                    $dataRow.append($('<td style="' + borderStyle + '">').text(value));
                });
            });
            
            $tbody.append($dataRow);
        });
        $table.append($tbody);

        $('#results').append($table);
        
        // Initialize DataTables plugin
        $('#comparisonTable').DataTable({
            responsive: true,
            pageLength: 10,
            order: [[0, 'asc']]
        });
    }
});
