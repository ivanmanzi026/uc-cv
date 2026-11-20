/**
 * ProCV - PDF Export Module
 * Generates professional A4 PDFs from the CV preview
 */

// ===== PDF GENERATION =====
function downloadPDF() {
    const preview = document.querySelector('.cv-preview');
    if (!preview) {
        showToast('❌ No CV to export');
        return;
    }
    
    // Show loading state
    showToast('⏳ Generating PDF...');
    
    // Use html2canvas and jsPDF for reliable PDF generation
    // We'll use a simple approach that works in modern browsers
    
    const pdfWindow = window.open('', '_blank', 'width=800,height=600');
    if (!pdfWindow) {
        showToast('❌ Please allow popups to download PDF');
        return;
    }
    
    // Get the rendered CV HTML
    const cvHTML = preview.outerHTML;
    const styles = document.querySelector('style')?.innerHTML || '';
    
    // Build the PDF HTML document
    pdfWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>CV - ${cvData.fullName || 'CV'}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    background: #f0f0f0; 
                    display: flex; 
                    justify-content: center; 
                    padding: 40px 0;
                    font-family: 'Inter', -apple-system, sans-serif;
                }
                .pdf-container {
                    width: 210mm;
                    min-height: 297mm;
                    background: white;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.1);
                    overflow: hidden;
                }
                .pdf-container * {
                    font-family: inherit;
                }
                ${styles}
                /* Fix for PDF rendering */
                .cv-preview {
                    width: 100% !important;
                    min-height: auto !important;
                    box-shadow: none !important;
                    transform: none !important;
                    font-size: 11px;
                    line-height: 1.5;
                }
                @media print {
                    body { padding: 0; background: white; }
                    .pdf-container { box-shadow: none; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="pdf-container">
                ${cvHTML}
            </div>
            <script>
                // Auto-print after load
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                };
            <\/script>
        </body>
        </html>
    `);
    
    pdfWindow.document.close();
    
    // Clean up after print
    pdfWindow.onafterprint = function() {
        // Optional: close window after print
        // pdfWindow.close();
    };
    
    showToast('📄 PDF ready for download');
}

// ===== ALTERNATIVE: JS PDF APPROACH =====
// If you want to use jsPDF library for more control:
/*
function downloadPDFWithJSPDF() {
    // Load jsPDF from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    document.head.appendChild(script);
    
    script.onload = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        
        // Get the CV content
        const preview = document.getElementById('cvPreview');
        const content = preview.innerText;
        
        // Simple text-based PDF (for more complex layouts, use html2canvas + jsPDF)
        doc.setFontSize(12);
        doc.text(content, 20, 20);
        doc.save('CV.pdf');
    };
}
*/

// ===== HTML2CANVAS APPROACH (Better for complex layouts) =====
/*
async function downloadPDFWithCanvas() {
    // Load html2canvas from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
    
    script.onload = async function() {
        const preview = document.querySelector('.cv-preview');
        const canvas = await html2canvas(preview, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 794, // A4 width in pixels at 96 DPI
            height: 1123 // A4 height in pixels at 96 DPI
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
        doc.save('CV.pdf');
    };
}
*/

// ===== PDF EXPORT WITH PRINT =====
function printCV() {
    window.print();
}

// ===== EXPORT =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { downloadPDF, printCV };
}