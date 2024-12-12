// utils/exportUtils.js

// Export to JSON
export const exportToJSON = (data, filename) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

// Export to CSV
export const exportToCSV = (data, filename) => {
    // Extract headers
    const headers = data.length > 0 ? Object.keys(data[0]) : [];

    // Convert data to CSV format
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header =>
                // Escape special characters and handle potential commas
                `"${row[header] !== undefined ? row[header].toString().replace(/"/g, '""') : ''}"`
            ).join(',')
        )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};