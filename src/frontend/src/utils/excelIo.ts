export interface ExcelExportData {
  records: any[];
  agents: any[];
  reminders?: any[];
  deals?: any[];
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(data: any[], headers: string[]): string {
  const rows = [headers.map(escapeCSV).join(',')];
  
  for (const item of data) {
    const row = headers.map(header => escapeCSV(item[header]));
    rows.push(row.join(','));
  }
  
  return rows.join('\n');
}

export async function exportToExcel(data: ExcelExportData): Promise<void> {
  let csvContent = '';

  // Records sheet
  if (data.records && data.records.length > 0) {
    const recordsData = data.records.map(r => ({
      ID: r.id,
      Category: r.category,
      Name: r.ownerName || r.fullName || r.name || r.title || '',
      Contact: r.contact || '',
      Address: r.address || r.location || '',
      Price: r.price || '',
      Budget: r.budget || '',
      Status: r.status || '',
      Priority: r.priority || '',
      CustomerCategory: r.customerCategory || '',
      Area: r.area || '',
      LandArea: r.landArea || '',
      Notes: r.notes || r.customRequirements || '',
      Starred: r.starred ? 'Yes' : 'No',
      CreatedAt: new Date(r.createdAt).toLocaleString()
    }));
    
    csvContent += '=== RECORDS ===\n';
    csvContent += arrayToCSV(recordsData, [
      'ID', 'Category', 'Name', 'Contact', 'Address', 'Price', 'Budget', 
      'Status', 'Priority', 'CustomerCategory', 'Area', 'LandArea', 'Notes', 'Starred', 'CreatedAt'
    ]);
    csvContent += '\n\n';
  }

  // Agents sheet
  if (data.agents && data.agents.length > 0) {
    const agentsData = data.agents.map(a => ({
      ID: a.id,
      Name: a.name || '',
      Contact: a.contact || '',
      Address: a.address || '',
      WorkArea: a.workArea || '',
      CreatedAt: new Date(a.createdAt).toLocaleString()
    }));
    
    csvContent += '=== AGENTS ===\n';
    csvContent += arrayToCSV(agentsData, ['ID', 'Name', 'Contact', 'Address', 'WorkArea', 'CreatedAt']);
    csvContent += '\n\n';
  }

  // Reminders sheet
  if (data.reminders && data.reminders.length > 0) {
    const remindersData = data.reminders.map(r => ({
      ID: r.id,
      Note: r.note || '',
      Date: r.date || '',
      Time: r.time || '',
      Dismissed: r.dismissed ? 'Yes' : 'No',
      CreatedAt: new Date(r.createdAt).toLocaleString()
    }));
    
    csvContent += '=== REMINDERS ===\n';
    csvContent += arrayToCSV(remindersData, ['ID', 'Note', 'Date', 'Time', 'Dismissed', 'CreatedAt']);
    csvContent += '\n\n';
  }

  // Deals sheet
  if (data.deals && data.deals.length > 0) {
    const dealsData = data.deals.map(d => ({
      ID: d.id,
      PropertyID: d.propertyId || '',
      BuyerID: d.buyerId || '',
      Status: d.status || '',
      FinalPrice: d.finalPrice || '',
      Commission: d.commission || '',
      AdvancePayment: d.advancePayment || '',
      Notes: d.notes || '',
      CreatedAt: new Date(d.createdAt).toLocaleString()
    }));
    
    csvContent += '=== DEALS ===\n';
    csvContent += arrayToCSV(dealsData, [
      'ID', 'PropertyID', 'BuyerID', 'Status', 'FinalPrice', 'Commission', 'AdvancePayment', 'Notes', 'CreatedAt'
    ]);
  }

  // Create and download CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `real-estate-export-${Date.now()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

export async function importFromExcel(file: File): Promise<ExcelExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        const result: ExcelExportData = {
          records: [],
          agents: [],
          reminders: [],
          deals: []
        };

        let currentSection = '';
        let headers: string[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (!line) continue;
          
          if (line.startsWith('=== RECORDS ===')) {
            currentSection = 'records';
            headers = [];
            continue;
          } else if (line.startsWith('=== AGENTS ===')) {
            currentSection = 'agents';
            headers = [];
            continue;
          } else if (line.startsWith('=== REMINDERS ===')) {
            currentSection = 'reminders';
            headers = [];
            continue;
          } else if (line.startsWith('=== DEALS ===')) {
            currentSection = 'deals';
            headers = [];
            continue;
          }
          
          if (!currentSection) continue;
          
          const values = parseCSVLine(line);
          
          if (headers.length === 0) {
            headers = values;
            continue;
          }
          
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          if (currentSection === 'records') {
            result.records.push({
              id: row.ID || `imported-${Date.now()}-${Math.random()}`,
              category: row.Category || 'Other',
              ownerName: row.Name || undefined,
              fullName: row.Name || undefined,
              name: row.Name || undefined,
              title: row.Name || undefined,
              contact: row.Contact || '',
              address: row.Address || '',
              location: row.Address || '',
              price: row.Price || '',
              budget: row.Budget || '',
              status: row.Status || undefined,
              priority: row.Priority || undefined,
              customerCategory: row.CustomerCategory || undefined,
              area: row.Area || '',
              landArea: row.LandArea || '',
              notes: row.Notes || '',
              customRequirements: row.Notes || '',
              starred: row.Starred === 'Yes',
              createdAt: Date.now(),
              attachments: []
            });
          } else if (currentSection === 'agents') {
            result.agents.push({
              id: row.ID || `agent-${Date.now()}-${Math.random()}`,
              name: row.Name || '',
              contact: row.Contact || '',
              address: row.Address || '',
              workArea: row.WorkArea || '',
              createdAt: Date.now(),
              citizenshipUpload: null
            });
          } else if (currentSection === 'reminders') {
            result.reminders!.push({
              id: row.ID || `reminder-${Date.now()}-${Math.random()}`,
              note: row.Note || '',
              date: row.Date || '',
              time: row.Time || '',
              dismissed: row.Dismissed === 'Yes',
              createdAt: Date.now()
            });
          } else if (currentSection === 'deals') {
            result.deals!.push({
              id: row.ID || `deal-${Date.now()}-${Math.random()}`,
              propertyId: row.PropertyID || '',
              buyerId: row.BuyerID || '',
              status: row.Status || '',
              finalPrice: row.FinalPrice || '',
              commission: row.Commission || '',
              advancePayment: row.AdvancePayment || '',
              notes: row.Notes || '',
              createdAt: Date.now()
            });
          }
        }

        resolve(result);
      } catch (error) {
        reject(new Error('Failed to parse CSV file. Please ensure it is a valid CSV file exported from this application.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };

    reader.readAsText(file);
  });
}
