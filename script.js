// ========= TAB NAVIGATION =========
const tabs = document.querySelectorAll('.tab');
const pages = document.querySelectorAll('.page');

function switchTab(tabId) {
  // Deactivate all
  tabs.forEach(t => t.classList.remove('active'));
  pages.forEach(p => p.classList.remove('active'));

  // Activate selected
  document.getElementById(tabId + 'Tab').classList.add('active');
  document.getElementById(tabId + 'Page').classList.add('active');
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.id.replace('Tab', '');
    switchTab(tabId);
  });
});

document.getElementById('goToDocs').addEventListener('click', () => switchTab('docs'));
document.getElementById('goToStore').addEventListener('click', () => switchTab('store'));

// ========= DOCUMENT MANAGER (Original Logic) =========
let uploadedFiles = [];

const fileInput = document.getElementById('fileInput');
const docTypeSelect = document.getElementById('docType');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const documentsList = document.getElementById('documentsList');
const templateButtons = document.querySelectorAll('.template-btn');

uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  const docType = docTypeSelect.value;

  if (!file) {
    showUploadStatus('Please select a file.', 'error');
    return;
  }

  if (!docType) {
    showUploadStatus('Please select a document type.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const fileData = {
      name: file.name,
      type: docType,
      size: file.size,
      url: e.target.result,
      uploadedAt: new Date().toLocaleString()
    };

    uploadedFiles.push(fileData);
    renderDocuments();
    showUploadStatus(`✅ "${file.name}" uploaded successfully!`, 'success');
    fileInput.value = '';
    docTypeSelect.value = '';
  };

  reader.readAsDataURL(file);
});

function showUploadStatus(message, type) {
  uploadStatus.textContent = message;
  uploadStatus.className = 'upload-status ' + type;
  uploadStatus.style.display = 'block';
  setTimeout(() => {
    uploadStatus.style.display = 'none';
  }, 5000);
}

function renderDocuments() {
  if (uploadedFiles.length === 0) {
    documentsList.innerHTML = '<p>No documents uploaded yet.</p>';
    return;
  }

  documentsList.innerHTML = `
    <ul>
      ${uploadedFiles.map((file, index) => `
        <li>
          <div>
            <strong>${file.name}</strong>
            <div class="file-meta">${formatDocType(file.type)} • ${formatBytes(file.size)} • ${file.uploadedAt}</div>
          </div>
          <a href="${file.url}" download="${file.name}">⬇️ Download</a>
        </li>
      `).join('')}
    </ul>
  `;
}

templateButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const docType = btn.dataset.type;
    generateTemplate(docType);
  });
});

function generateTemplate(docType) {
  let content = '';
  const now = new Date().toLocaleDateString();

  switch(docType) {
    case 'commercial_invoice':
      content = `COMMERCIAL INVOICE\n\nDate: ${now}\nInvoice No: INV-2024-001\n\nSeller: Your Export Co.\nBuyer: Overseas Importer Ltd.\n\nDescription: Electronic Components\nQuantity: 500 Units\nUnit Price: $10.00\nTotal: $5,000.00\n\nTerms: FOB Shanghai Port\n\nSignature: ________________`;
      break;

    case 'packing_list':
      content = `PACKING LIST\n\nDate: ${now}\nShipment ID: SHP-2024-001\n\nItem: Widget Model X\nTotal Cartons: 10\nGross Weight: 200 kg\nNet Weight: 180 kg\nDimensions: 50x40x30 cm per carton\n\nMarks & Numbers: "FRAGILE - HANDLE WITH CARE"\n\nPrepared by: Logistics Dept.`;
      break;

    case 'bill_of_lading':
      content = `BILL OF LADING (B/L)\n\nB/L No: BL-2024-M-1001\nVessel: MSC Orion\nPort of Loading: Shanghai\nPort of Discharge: Los Angeles\n\nShipper: Your Export Co.\nConsignee: Overseas Importer Ltd.\n\nDescription of Goods: 10 Cartons Electronic Goods\n\nFreight: Prepaid\n\nIssue Date: ${now}\n\nSigned: ___________________ (Carrier)`;
      break;

    case 'certificate_of_origin':
      content = `CERTIFICATE OF ORIGIN\n\nIssued on: ${now}\n\nExporter: Your Export Co., Shanghai, China\nImporter: Overseas Importer Ltd., California, USA\n\nProduct: Electronic Components\nHS Code: 8542.31\nOrigin Criteria: Wholly Obtained in China\n\nCertified by:\nChamber of Commerce\nSignature & Stamp: ________________`;
      break;

    default:
      content = `Template for ${docType} not defined.`;
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

  alert(`📄 ${formatDocType(docType)} generated and downloaded!`);
}

function formatDocType(type) {
  const map = {
    commercial_invoice: 'Commercial Invoice',
    packing_list: 'Packing List',
    bill_of_lading: 'Bill of Lading',
    certificate_of_origin: 'Certificate of Origin',
    import_export_license: 'Import/Export License',
    customs_declaration: 'Customs Declaration'
  };
  return map[type] || type;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========= STORE MANAGER (New Feature) =========
let products = [];

const productNameInput = document.getElementById('productName');
const productSKUInput = document.getElementById('productSKU');
const productQtyInput = document.getElementById('productQty');
const productPriceInput = document.getElementById('productPrice');
const productDescInput = document.getElementById('productDesc');
const addProductBtn = document.getElementById('addProductBtn');
const productsList = document.getElementById('productsList');

addProductBtn.addEventListener('click', () => {
  const name = productNameInput.value.trim();
  const sku = productSKUInput.value.trim();
  const qty = parseInt(productQtyInput.value);
  const price = parseFloat(productPriceInput.value);
  const desc = productDescInput.value.trim();

  if (!name || !sku || isNaN(qty) || qty < 0 || isNaN(price) || price <= 0) {
    alert('❌ Please fill all fields correctly.');
    return;
  }

  const product = {
    id: Date.now(), // simple unique ID
    name,
    sku,
    qty,
    price,
    desc,
    addedAt: new Date().toLocaleString()
  };

  products.push(product);
  renderProducts();

  // Reset form
  productNameInput.value = '';
  productSKUInput.value = '';
  productQtyInput.value = '';
  productPriceInput.value = '';
  productDescInput.value = '';

  alert(`✅ Product "${name}" added to catalog!`);
});

function renderProducts() {
  if (products.length === 0) {
    productsList.innerHTML = '<p>No products added yet.</p>';
    return;
  }

  productsList.innerHTML = `
    <ul>
      ${products.map(p => `
        <li>
          <div>
            <strong>${p.name}</strong> <small>(${p.sku})</small>
            <div class="product-meta">
              $${p.price.toFixed(2)} • ${p.qty} in stock • Added: ${p.addedAt}
              ${p.desc ? `<br><em>${p.desc}</em>` : ''}
            </div>
          </div>
          <div class="actions">
            <a href="#" class="edit-btn" data-id="${p.id}">✏️ Edit</a>
            <a href="#" class="delete-btn" data-id="${p.id}">🗑️ Delete</a>
          </div>
        </li>
      `).join('')}
    </ul>
  `;

  // Attach event listeners to Edit/Delete (basic demo — no actual edit UI yet)
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = parseInt(e.target.dataset.id);
      products = products.filter(p => p.id !== id);
      renderProducts();
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      alert("✏️ Edit feature coming soon! In a full version, a modal would open here.");
    });
  });
}

// INITIAL RENDER
renderDocuments();
renderProducts();