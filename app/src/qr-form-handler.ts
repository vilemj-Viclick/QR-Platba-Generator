import QRCode from 'qrcode';
import {generateQRString, QRPlatbaRequest, validateQRPlatbaRequest} from 'qr-platba-generator';

// Interface for field-specific errors
interface FieldErrors {
  readonly [key: string]: {
    readonly msg: string;
    readonly code: string;
  };
}

interface HistoryItem {
  acc: string;
  rec: string;
  am: string;
  cc: string;
  vs: string;
  ss: string;
  ks: string;
  dt: string;
  msg: string;
}

const STORAGE_KEY = 'qr_history';
const MAX_HISTORY = 10;

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initQRFormHandlers();
  initSmoothScrolling();
  initSupportButton();
});

function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function initSmoothScrolling() {
  // Find the info link
  const infoLink = document.querySelector('.info-link');
  
  if (infoLink) {
    infoLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the target element from the href attribute
      const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      if (!href) return;
      
      const targetId = href.substring(1); // Remove the # character
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // Update the URL with the hash fragment
        window.history.pushState(null, '', href);
        
        // Scroll to the target element smoothly
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }
  
  // Handle direct navigation to hash on page load
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // Use setTimeout to ensure the page is fully loaded
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }
}

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
  const clearFormButton = document.getElementById('clear-form') as HTMLButtonElement;

  // Render initial history
  renderHistory();

  // Add event listener for clear button
  if (clearFormButton) {
    clearFormButton.addEventListener('click', () => {
      form.reset();
      clearErrors();
      
      // Reset character counters
      recCharsElement.textContent = `Zbývá 250 znaků`;
      msgCharsElement.textContent = `Zbývá 250 znaků`;
      
      // Reset QR code result
      qrPlaceholder.style.display = 'flex';
      qrResult.style.display = 'none';
      qrImage.src = '';
    });
  }

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
        const firstError = document.querySelector('.input-error');
        if(firstError && !isElementInViewport(firstError)){
          firstError.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
        }
        return;
      }

      // Generate QR code string
      const qrString = generateQRString(payload as QRPlatbaRequest);

      // Generate QR code as data URL
      const qrCodeDataURL = await QRCode.toDataURL(qrString);

      // Save to history
      saveToHistory({
        acc: formData.get('acc') as string,
        rec: formData.get('rec') as string,
        am: formData.get('am') as string,
        cc: formData.get('cc') as string,
        vs: formData.get('vs') as string,
        ss: formData.get('ss') as string,
        ks: formData.get('ks') as string,
        dt: formData.get('dt') as string,
        msg: formData.get('msg') as string
      });

      // Display the QR code
      qrImage.src = qrCodeDataURL;
      qrPlaceholder.style.display = 'none';
      qrResult.style.display = 'block';
      const firstError = document.querySelector('.input-error');
      if(!isElementInViewport(qrResult)){
        qrResult.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
      }
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

  // History management functions
  function loadHistory(): HistoryItem[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing history:', e);
      return [];
    }
  }

  function saveToHistory(item: HistoryItem) {
    let history = loadHistory();
    // Only remember one form config for one account number
    history = history.filter(h => h.acc !== item.acc);
    // Add to the beginning
    history.unshift(item);
    // Remember only 10 latest
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    const history = loadHistory();
    const historyContainer = document.getElementById('qr-history');
    const historyList = document.getElementById('qr-history-list');
    
    if (!historyContainer || !historyList) return;
    
    if (history.length === 0) {
      historyContainer.classList.add('hidden');
      return;
    }
    
    historyContainer.classList.remove('hidden');
    historyList.innerHTML = '';
    
    history.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';
      
      const displayName = item.rec || item.acc;
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'history-item-name';
      nameSpan.textContent = displayName;
      
      const accSpan = document.createElement('span');
      accSpan.className = 'history-item-acc';
      accSpan.textContent = item.acc;
      
      li.appendChild(nameSpan);
      li.appendChild(accSpan);
      
      li.addEventListener('click', () => {
        populateForm(item);
        // Trigger generation
        form.dispatchEvent(new Event('submit'));
      });
      
      historyList.appendChild(li);
    });
  }

  function populateForm(item: HistoryItem) {
    const fields: (keyof HistoryItem)[] = ['acc', 'rec', 'am', 'cc', 'vs', 'ss', 'ks', 'dt', 'msg'];
    fields.forEach(field => {
      const element = document.getElementById(field);
      if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
        element.value = item[field] || '';
      }
    });
    
    // Trigger input events to update character counters
    recInput.dispatchEvent(new Event('input'));
    msgInput.dispatchEvent(new Event('input'));
  }
}

/**
 * Initialize the support button functionality
 */
function initSupportButton() {
  const supportButton = document.getElementById('support-button');
  const supportQR = document.getElementById('support-qr');
  
  if (supportButton && supportQR) {
    supportButton.addEventListener('click', function() {
      supportQR.classList.toggle('hidden');
      if(!supportQR.classList.contains('hidden')){
        supportQR.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
      }
      supportButton.textContent = supportQR.classList.contains('hidden') ? 'Podpořit' : 'Skrýt';
    });
  }
}