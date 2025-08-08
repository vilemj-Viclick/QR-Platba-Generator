import QRCode from 'qrcode';
import {generateQRString, QRPlatbaRequest, validateQRPlatbaRequest} from 'qr-platba-generator';

// Interface for field-specific errors
interface FieldErrors {
  readonly [key: string]: {
    readonly msg: string;
    readonly code: string;
  };
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initQRFormHandlers();
});

function initQRFormHandlers() {
  // Get form elements
  const form = document.getElementById('qr-form') as HTMLFormElement;
  const recInput = document.getElementById('rec') as HTMLInputElement;
  const msgInput = document.getElementById('msg') as HTMLInputElement;
  const recCharsElement = document.getElementById('rec-chars') as HTMLElement;
  const msgCharsElement = document.getElementById('msg-chars') as HTMLElement;
  const generalErrorElement = document.getElementById('general-error') as HTMLElement;
  const qrPlaceholder = document.getElementById('qr-placeholder') as HTMLElement;
  const qrResult = document.getElementById('qr-result') as HTMLElement;
  const qrImage = document.getElementById('qr-image') as HTMLImageElement;

  // Add event listeners for character counters
  recInput.addEventListener('input', () => {
    const remaining = 250 - recInput.value.length;
    recCharsElement.textContent = `Zbývá ${remaining} znaků`;
  });

  msgInput.addEventListener('input', () => {
    const remaining = 250 - msgInput.value.length;
    msgCharsElement.textContent = `Zbývá ${remaining} znaků`;
  });

  // Add event listener for form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Hide QR code
    qrPlaceholder.style.display = 'flex';
    qrResult.style.display = 'none';

    try {
      // Get form data
      const formData = new FormData(form);
      const payload: Partial<QRPlatbaRequest> = {
        acc: formData.get('acc') as string,
        rec: formData.get('rec') as string,
        am: parseFloat(formData.get('am') as string),
        cc: formData.get('cc') as string,
        vs: formData.get('vs') as string,
        ss: formData.get('ss') as string,
        ks: formData.get('ks') as string,
        dt: formatDate(formData.get('dt') as string),
        msg: formData.get('msg') as string
      };

      // Validate the request data
      const validationErrors = validateQRPlatbaRequest(payload as QRPlatbaRequest);

      // If there are any validation errors, display them
      if (validationErrors) {
        displayErrors(validationErrors);
        document.querySelector('.input-error')?.scrollIntoView({behavior: 'smooth'});
        return;
      }

      // Generate QR code string
      const qrString = generateQRString(payload as QRPlatbaRequest);

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrString);

      // Display the QR code
      qrImage.src = qrCodeDataURL;
      qrPlaceholder.style.display = 'none';
      qrResult.style.display = 'block';
      qrResult.scrollIntoView({behavior: 'smooth'});
    } catch (err) {
      console.error('Error generating QR code:', err);
      generalErrorElement.textContent = 'Při generování QR kódu došlo k neočekávané chybě';
      generalErrorElement.style.display = 'block';
    }
  });

  // Helper function to format date from YYYY-MM-DD to YYYYMMDD
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    return dateString.replace(/-/g, '');
  }

  // Helper function to clear all error messages
  function clearErrors() {
    generalErrorElement.style.display = 'none';
    generalErrorElement.textContent = '';
    
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(element => {
      element.textContent = '';
      if(element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });
    
    const inputElements = document.querySelectorAll('input, select');
    inputElements.forEach(element => {
      element.classList.remove('input-error');
    });
  }

  // Helper function to display validation errors
  function displayErrors(errors: FieldErrors) {
    for (const [field, error] of Object.entries(errors)) {
      const errorElement = document.getElementById(`${field}-error`);
      const inputElement = document.getElementById(field);
      
      if (errorElement && inputElement) {
        errorElement.textContent = error.msg;
        errorElement.style.display = 'block';
        inputElement.classList.add('input-error');
      }
    }
  }
}