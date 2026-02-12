export function searchRecords(records: any[], query: string): any[] {
  if (!query.trim()) return records;

  const lowerQuery = query.toLowerCase();
  
  return records.filter(record => {
    const searchableFields = [
      record.ownerName,
      record.name,
      record.fullName,
      record.title,
      record.contact,
      record.address,
      record.location,
      record.propertyType,
      record.category,
      record.notes
    ];

    return searchableFields.some(field => 
      field && String(field).toLowerCase().includes(lowerQuery)
    );
  });
}
