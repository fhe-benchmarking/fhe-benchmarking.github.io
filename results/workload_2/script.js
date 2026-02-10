$(document).ready(function() {
    // Pattern to match JSON files
    const jsonPattern = /.*\.json$/;
    let jsonFiles = [];
    let allData = [];
    let allKeys = new Set();

    jsonFiles = ['submission_01.json', 'submission_02.json', 'submission_03.json']; // List of JSON files to load
    
    
    loadJsonFiles();

    // Function to flatten nested JSON objects
    function flattenJson(obj, prefix = '') {
        let flattened = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                let newKey = prefix ? prefix + '_' + key : key;
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                    Object.assign(flattened, flattenJson(obj[key], newKey));
                } else {
                    flattened[newKey] = obj[key];
                }
            }
        }
        console.log('Flattened JSON:', flattened);
        return flattened;
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
                    
                    // Collect all keys
                    $.each(flatData, function(key) {
                        allKeys.add(key);
                    });
                    
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
        
        // Create header row with all keys
        let $thead = $('<thead>');
        let $headerRow = $('<tr>');
        $headerRow.append($('<th>').text('Submission'));
        $.each(Array.from(allKeys).sort(), function(index, key) {
            $headerRow.append($('<th>').text(key.replace(/_/g, ' ')));
        });
        $thead.append($headerRow);
        $table.append($thead);

        // Create table body with data rows
        let $tbody = $('<tbody>');
        $.each(allData, function(index, item) {
            let $dataRow = $('<tr>');
            // Extract filename without extension
            let fileName = item.file.split('/').pop().replace('.json', '');
            $dataRow.append($('<td>').text(fileName));
            $.each(Array.from(allKeys).sort(), function(keyIndex, key) {
                let value = item.data[key] || '-';
                $dataRow.append($('<td>').text(value));
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
