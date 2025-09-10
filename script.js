// ========== DOCUMENT MANAGER ==========
if (document.getElementById('uploadBtn')) {
  let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles')) || [];

  const fileInput = document.getElementById('fileInput');
  const docTypeSelect = document.getElementById('docType');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadStatus = document.getElementById('uploadStatus');
  const documentsList = document.getElementById('documentsList');
  const templateButtons = document.querySelectorAll('.template-btn');

  function saveFiles() {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }

  uploadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    const docType = docTypeSelect.value;

    if (!file) return showUploadStatus('Please select a file.', 'error');
    if (!docType) return showUploadStatus('Please select a document type.', 'error');

    const reader = new FileReader();
    reader.onload = function(e) {
      uploadedFiles.push({
        name: file.name,
        type: docType,
        size: file.size,
        url: e.target.result,
        uploadedAt: new Date().toLocaleString()
      });
      saveFiles();
      renderDocuments();
      showUploadStatus(`✅ "${file.name}" uploaded!`, 'success');
      fileInput.value = ''; docTypeSelect.value = '';
    };
    reader.readAsDataURL(file);
  });

  function showUploadStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = 'upload-status ' + type;
    uploadStatus.style.display = 'block';
    setTimeout(() => uploadStatus.style.display = 'none', 5000);
  }

  function renderDocuments() {
    documentsList.innerHTML = uploadedFiles.length === 0
      ? '<p>No documents uploaded yet.</p>'
      : `<ul>${uploadedFiles.map((file, i) => `
          <li>
            <div>
              <strong>${file.name}</strong>
              <div class="file-meta">${formatDocType(file.type)} • ${formatBytes(file.size)} • ${file.uploadedAt}</div>
            </div>
            <a href="${file.url}" download="${file.name}">⬇️ Download</a>
          </li>
        `).join('')}</ul>`;
  }

  templateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const docType = btn.dataset.type;
      let content = '';
      const now = new Date().toLocaleDateString();

      switch(docType) {
        case 'commercial_invoice':
          content = `COMMERCIAL INVOICE\nDate: ${now}\nInvoice No: INV-2024-001\nSeller: Your Export Co.\nBuyer: Overseas Importer Ltd.\nDescription: Electronic Components\nQuantity: 500 Units\nTotal: $5,000.00`;
          break;
        case 'packing_list':
          content = `PACKING LIST\nDate: ${now}\nItem: Widget Model X\nTotal Cartons: 10\nGross Weight: 200 kg`;
          break;
        case 'bill_of_lading':
          content = `BILL OF LADING\nB/L No: BL-2024-M-1001\nVessel: MSC Orion\nPort of Loading: Shanghai`;
          break;
        case 'certificate_of_origin':
          content = `CERTIFICATE OF ORIGIN\nIssued on: ${now}\nProduct: Electronic Components\nOrigin: China`;
          break;
        default:
          content = `Template for ${docType}`;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docType}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert(`📄 ${formatDocType(docType)} generated!`);
    });
  });

  function formatDocType(type) {
    const map = {
      commercial_invoice: 'Commercial Invoice',
      packing_list: 'Packing List',
      bill_of_lading: 'Bill of Lading',
      certificate_of_origin: 'Certificate of