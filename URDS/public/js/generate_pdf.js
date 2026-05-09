document.getElementById("printBtn").addEventListener("click", function () {
  // Initialize jsPDF instance
  const doc = new jsPDF();

  // Capture the proposal preview content
  const content = document.getElementById("previewContent");

  // Use html2pdf.js to convert HTML content to a PDF
  const options = {
    margin: 10,
    filename: 'Proposal_Preview.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  // Generate the PDF
  html2pdf().from(content).set(options).save();
});
