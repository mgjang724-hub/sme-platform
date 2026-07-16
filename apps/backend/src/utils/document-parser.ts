import AdmZip from 'adm-zip';

export function extractTextFromDoc(filePath: string): string {
  try {
    const zip = new AdmZip(filePath);
    const extension = filePath.split('.').pop()?.toLowerCase();

    if (extension === 'hwpx') {
      // HWPX text is in Contents/section0.xml inside <hp:t> tags
      const entry = zip.getEntry('Contents/section0.xml');
      if (!entry) return '';
      const xml = entry.getData().toString('utf8');
      
      // Matches <hp:t> tag text, supporting optional attributes like xml:space
      const matches = xml.match(/<hp:t(?:\s+[^>]*)?>(.*?)<\/hp:t>/g);
      if (!matches) return '';
      
      return matches
        .map(m => m.replace(/<hp:t(?:\s+[^>]*)?>/g, '').replace(/<\/hp:t>/g, ''))
        .join('\n');
    }

    if (extension === 'docx') {
      // DOCX text is in word/document.xml inside <w:t> tags
      const entry = zip.getEntry('word/document.xml');
      if (!entry) return '';
      const xml = entry.getData().toString('utf8');
      
      const matches = xml.match(/<w:t(?:\s+[^>]*)?>(.*?)<\/w:t>/g);
      if (!matches) return '';
      
      return matches
        .map(m => m.replace(/<w:t(?:\s+[^>]*)?>/g, '').replace(/<\/w:t>/g, ''))
        .join(' ');
    }
  } catch (err) {
    console.error('Failed to extract text from document', err);
  }
  return '';
}
