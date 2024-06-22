

export const convertToCSV = (arr: {name: string, email: string, awardYear: number, ageGroup: string, totalHours: number, achievmentLevel: string}[]) => {
    const header = Object.keys(arr[0]).join(',') + '\n';
    const rows = arr.map(record => Object.values(record).join(',')).join('\n');
    return header + rows;
};

// Function to trigger CSV download
export const downloadCSV = (data: string, fileName: string) => {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};