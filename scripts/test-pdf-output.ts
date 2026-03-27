import { jsPDF } from 'jspdf';

async function testPdfOutput() {
  const doc = new jsPDF();
  doc.text("Hello World", 10, 10);
  
  const dataUri = doc.output('datauristring');
  console.log('Data URI start:', dataUri.substring(0, 100));
  
  const parts = dataUri.split(',');
  console.log('Parts length:', parts.length);
  
  const pdfBase64 = parts[1];
  console.log('Base64 start:', pdfBase64.substring(0, 50));
  
  // Verify PDF header
  const decodedStart = Buffer.from(pdfBase64.substring(0, 20), 'base64').toString('utf8');
  console.log('Decoded start:', decodedStart);
  
  if (decodedStart.startsWith('%PDF-')) {
    console.log('✅ Valid PDF header');
  } else {
    console.log('❌ Invalid PDF header');
  }
}

testPdfOutput().catch(console.error);
