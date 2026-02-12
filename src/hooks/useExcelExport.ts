import * as XLSX from 'xlsx';

interface ExcelExportOptions<T> {
  data: T[];
  filename: string;
  sheetName?: string;
}

export const useExcelExport = () => {
  const exportToExcel = <T>({ data, filename, sheetName = 'Sheet1' }: ExcelExportOptions<T>): void => {
    try {
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Auto-width for columns
      const columnWidths = Object.keys(data[0] as object).map(key => ({
        wch: Math.max(key.length, ...(data as any[]).map((row: any) => row[key] ? row[key].toString().length : 0)) + 2
      }));
      ws['!cols'] = columnWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  };

  return { exportToExcel };
};
