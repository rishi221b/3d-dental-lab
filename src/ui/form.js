/**
 * Case Inquiry Form controller.
 * Client-side validation, scan file attachment handling, and submission state.
 */

export function initCaseForm() {
  const form = document.getElementById('case-inquiry-form');
  const fileInput = document.getElementById('scan-file-input');
  const dropzone = document.getElementById('scan-dropzone');
  const fileListContainer = document.getElementById('scan-file-list');
  const successModal = document.getElementById('form-success-card');
  const resetBtn = document.getElementById('reset-case-form-btn');

  if (!form) return;

  const uploadedFiles = [];

  // Drag and drop events
  if (dropzone && fileInput) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files && files.length) {
        handleFiles(files);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length) {
        handleFiles(fileInput.files);
      }
    });
  }

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Only keep unique file names
      if (!uploadedFiles.some((f) => f.name === file.name)) {
        uploadedFiles.push(file);
      }
    }
    renderFileList();
  }

  function renderFileList() {
    if (!fileListContainer) return;
    if (uploadedFiles.length === 0) {
      fileListContainer.innerHTML = '';
      return;
    }

    fileListContainer.innerHTML = uploadedFiles
      .map(
        (f, idx) => `
        <div class="file-chip">
          <svg class="file-icon" viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
          </svg>
          <span class="file-name">${escapeHtml(f.name)} (${(f.size / 1024).toFixed(1)} KB)</span>
          <button type="button" class="remove-file-btn" data-index="${idx}" aria-label="Remove ${escapeHtml(f.name)}">&times;</button>
        </div>
      `
      )
      .join('');

    // Attach remove listeners
    fileListContainer.querySelectorAll('.remove-file-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index, 10);
        uploadedFiles.splice(index, 1);
        renderFileList();
      });
    });
  }

  // Field validation rules
  function validateField(input) {
    const errorEl = document.getElementById(`${input.id}-error`);
    let isValid = true;
    let message = '';

    const val = input.value.trim();

    if (input.required && !val) {
      isValid = false;
      message = 'This field is required.';
    } else if (input.type === 'email' && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        isValid = false;
        message = 'Please enter a valid clinical email address.';
      }
    } else if (input.id === 'phone' && val) {
      const phoneDigits = val.replace(/\D/g, '');
      if (phoneDigits.length < 7) {
        isValid = false;
        message = 'Please enter a valid telephone number.';
      }
    }

    if (!isValid) {
      input.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      input.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }

    return isValid;
  }

  // Real-time validation on blur & input
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('has-error')) {
        validateField(input);
      }
    });
  });

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let allValid = true;
    inputs.forEach((input) => {
      if (!validateField(input)) {
        allValid = false;
      }
    });

    if (!allValid) {
      const firstInvalid = form.querySelector('.has-error');
      firstInvalid?.focus();
      return;
    }

    // Submit state handler
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="btn-spinner" aria-hidden="true"></span>
        <span>Transmitting Prescription...</span>
      `;
    }

    setTimeout(() => {
      // Gather summary data
      const name = form.querySelector('#name')?.value || 'Doctor';
      const clinic = form.querySelector('#clinic')?.value || 'Partner Dental Clinic';
      const service = form.querySelector('#service')?.value || 'Digital Restorations';
      const email = form.querySelector('#email')?.value || 'doctor@clinic.com';
      const caseRef = `SS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Update success card details
      const refEl = document.getElementById('success-case-ref');
      const clinicEl = document.getElementById('success-clinic-name');
      const serviceEl = document.getElementById('success-service-name');
      const emailEl = document.getElementById('success-email-notice');
      const filesEl = document.getElementById('success-files-count');

      if (refEl) refEl.textContent = caseRef;
      if (clinicEl) clinicEl.textContent = `${name} — ${clinic}`;
      if (serviceEl) serviceEl.textContent = service;
      if (emailEl) emailEl.textContent = `Confirmation dispatch queued for ${email}`;
      if (filesEl) {
        filesEl.textContent =
          uploadedFiles.length > 0
            ? `${uploadedFiles.length} digital scan asset(s) attached`
            : 'No direct scan attached (upload via clinic portal)';
      }

      form.classList.add('is-hidden');
      if (successModal) {
        successModal.classList.remove('is-hidden');
        successModal.focus();
        successModal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    }, 900);
  });

  // Reset form
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      uploadedFiles.length = 0;
      renderFileList();
      inputs.forEach((input) => {
        input.classList.remove('has-error');
        input.removeAttribute('aria-invalid');
        const err = document.getElementById(`${input.id}-error`);
        if (err) err.textContent = '';
      });

      if (successModal) successModal.classList.add('is-hidden');
      form.classList.remove('is-hidden');
      form.querySelector('#name')?.focus();
    });
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
