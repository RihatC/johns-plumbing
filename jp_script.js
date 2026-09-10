/**
 * JOHNS PLUMBING - MAIN INTERACTIVE SCRIPT
 * Handles mobile navigation, phone formatting, service auto-selection,
 * drag-and-drop file preview, form validation, and confirmation modal.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. MOBILE NAVIGATION TOGGLE
  // --------------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu when a navigation item is clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 2. QUICK SERVICE CARD AUTO-SELECTION
  // --------------------------------------------------------------------------
  const serviceLinks = document.querySelectorAll('.service-link[data-service]');
  const serviceSelect = document.getElementById('serviceNeeded');

  serviceLinks.forEach(link => {
    link.addEventListener('click', () => {
      const selectedService = link.getAttribute('data-service');
      if (selectedService && serviceSelect) {
        for (let i = 0; i < serviceSelect.options.length; i++) {
          if (serviceSelect.options[i].value === selectedService) {
            serviceSelect.selectedIndex = i;
            break;
          }
        }
        // Clear any previous validation errors
        serviceSelect.classList.remove('is-invalid');
        const serviceError = document.getElementById('serviceError');
        if (serviceError) serviceError.classList.remove('visible');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. PHONE NUMBER AUTO-FORMATTING ( (555) 000-0000 )
  // --------------------------------------------------------------------------
  const phoneInput = document.getElementById('phoneNumber');

  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
      if (!x[2]) {
        e.target.value = x[1] ? `(${x[1]}` : '';
      } else {
        e.target.value = `(${x[1]}) ${x[2]}` + (x[3] ? `-${x[3]}` : '');
      }
    });
  }

  // --------------------------------------------------------------------------
  // 4. DRAG-AND-DROP FILE UPLOAD PREVIEW
  // --------------------------------------------------------------------------
  const photoDropzone = document.getElementById('photoDropzone');
  const fileInput = document.getElementById('fileInput');
  const dropzonePrompt = document.getElementById('dropzonePrompt');
  const dropzonePreview = document.getElementById('dropzonePreview');
  const previewImg = document.getElementById('previewImg');
  const previewName = document.getElementById('previewName');
  const btnRemoveFile = document.getElementById('btnRemoveFile');

  if (photoDropzone && fileInput) {
    // Open file dialog when clicking dropzone
    photoDropzone.addEventListener('click', (e) => {
      if (e.target !== btnRemoveFile && !btnRemoveFile.contains(e.target)) {
        fileInput.click();
      }
    });

    // Handle Drag & Drop styling
    ['dragenter', 'dragover'].forEach(eventName => {
      photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoDropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      photoDropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoDropzone.classList.remove('dragover');
      }, false);
    });

    // Handle file drop
    photoDropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files[0]) {
        handleUploadedFile(files[0]);
      }
    });

    // Handle file input change
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        handleUploadedFile(fileInput.files[0]);
      }
    });

    // Remove file button
    if (btnRemoveFile) {
      btnRemoveFile.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        dropzonePreview.style.display = 'none';
        dropzonePrompt.style.display = 'block';
        previewImg.src = '#';
      });
    }
  }

  function handleUploadedFile(file) {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Only image files (PNG, JPG, WEBP) are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      previewName.textContent = file.name;
      dropzonePrompt.style.display = 'none';
      dropzonePreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
  }

  // --------------------------------------------------------------------------
  // 5. FORM VALIDATION & MODAL SUBMISSION
  // --------------------------------------------------------------------------
  const quoteForm = document.getElementById('freeQuoteForm');
  const fullNameInput = document.getElementById('fullName');
  const nameError = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');
  const serviceError = document.getElementById('serviceError');
  const submitQuoteBtn = document.getElementById('submitQuoteBtn');
  const btnSpinner = document.getElementById('btnSpinner');

  const quoteSuccessModal = document.getElementById('quoteSuccessModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDoneBtn = document.getElementById('modalDoneBtn');
  const modalCustomerName = document.getElementById('modalCustomerName');
  const modalCustomerPhone = document.getElementById('modalCustomerPhone');
  const modalTicketId = document.getElementById('modalTicketId');

  if (quoteForm) {
    // Real-time error removal
    [fullNameInput, phoneInput, serviceSelect].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const err = input.parentElement.querySelector('.field-error-msg');
          if (err) err.classList.remove('visible');
        });
      }
    });

    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      // Validate Name
      if (!fullNameInput.value.trim()) {
        fullNameInput.classList.add('is-invalid');
        nameError.classList.add('visible');
        isValid = false;
      } else {
        fullNameInput.classList.remove('is-invalid');
        nameError.classList.remove('visible');
      }

      // Validate Phone (digits count >= 10)
      const digitsOnly = phoneInput.value.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        phoneInput.classList.add('is-invalid');
        phoneError.classList.add('visible');
        isValid = false;
      } else {
        phoneInput.classList.remove('is-invalid');
        phoneError.classList.remove('visible');
      }

      // Validate Service
      if (!serviceSelect.value) {
        serviceSelect.classList.add('is-invalid');
        serviceError.classList.add('visible');
        isValid = false;
      } else {
        serviceSelect.classList.remove('is-invalid');
        serviceError.classList.remove('visible');
      }

      if (!isValid) return;

      // Simulate asynchronous dispatch processing
      submitQuoteBtn.disabled = true;
      btnSpinner.style.display = 'inline-block';

      setTimeout(() => {
        submitQuoteBtn.disabled = false;
        btnSpinner.style.display = 'none';

        // Fill modal details
        const randomTicket = '#APX-' + Math.floor(10000 + Math.random() * 90000);
        modalCustomerName.textContent = fullNameInput.value.trim();
        modalCustomerPhone.textContent = phoneInput.value.trim();
        modalTicketId.textContent = randomTicket;

        // Open Modal
        quoteSuccessModal.classList.add('open');
        quoteSuccessModal.setAttribute('aria-hidden', 'false');

        // Reset form
        quoteForm.reset();
        if (btnRemoveFile) btnRemoveFile.click();
      }, 900);
    });
  }

  // Close modal handlers
  const closeModal = () => {
    quoteSuccessModal.classList.remove('open');
    quoteSuccessModal.setAttribute('aria-hidden', 'true');
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);
  if (quoteSuccessModal) {
    quoteSuccessModal.addEventListener('click', (e) => {
      if (e.target === quoteSuccessModal) closeModal();
    });
  }

  // --------------------------------------------------------------------------
  // 6. INTERACTIVE MAP DEMO
  // --------------------------------------------------------------------------
  const serviceMap = document.getElementById('serviceMap');
  if (serviceMap) {
    serviceMap.addEventListener('click', () => {
      alert('Clarke County Coverage: 4 Mobile Response Units Active.\nAverage response time: 28 minutes.');
    });
  }
});