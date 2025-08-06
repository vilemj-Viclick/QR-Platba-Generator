import React, {useState, useEffect} from 'react';
import QRCode from 'qrcode';
import {generateQRString, QRPlatbaRequest, validateQRPlatbaRequest} from 'qr-platba-generator';

type FormData = {
  [key in keyof QRPlatbaRequest]: string;
};

// Interface for field-specific errors
interface FieldErrors {
  readonly [key: string]: {
    readonly msg: string;
    readonly code: string;
  };
}

export const QRForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    acc: '',
    rec: '',
    am: '',
    cc: 'CZK',
    vs: '',
    ss: '',
    ks: '',
    dt: '',
    msg: ''
  });

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [recCharsRemaining, setRecCharsRemaining] = useState<number>(250 - (formData.rec?.length ?? 0));
  const [msgCharsRemaining, setMsgCharsRemaining] = useState<number>(250 - (formData.msg?.length ?? 0));
  
  // Update character counters when formData changes
  useEffect(() => {
    setRecCharsRemaining(250 - (formData.rec?.length ?? 0));
    setMsgCharsRemaining(250 - (formData.msg?.length ?? 0));
  }, [formData.rec, formData.msg]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    
    // Special handling for the date field
    if (name === 'dt' && value) {
      // Convert from YYYY-MM-DD to YYYYMMDD
      const formattedDate = value.replace(/-/g, '');
      setFormData(prev => ({...prev, [name]: formattedDate}));
    } else {
      setFormData(prev => ({...prev, [name]: value}));
    }

    // Clear error for this field when the user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setQrCode(null);

    try {
      // Convert amount to number
      const payload: QRPlatbaRequest = {
        ...formData,
        am: parseFloat(formData.am)
      };

      // Validate the request data locally
      const validationErrors = validateQRPlatbaRequest(payload);

      // If there are any validation errors, display them
      if (validationErrors) {
        setErrors(validationErrors);
        return;
      }

      // Generate QR code string
      const qrString = generateQRString(payload);

      // Generate QR code as data URL directly
      const qrCodeDataURL = await QRCode.toDataURL(qrString);

      // Set the QR code
      setQrCode(qrCodeDataURL);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setGeneralError('Při generování QR kódu došlo k neočekávané chybě');
    }
  };

  return (
    <div className="qr-form-container">
      <div className="qr-form-wrapper">
        <h2>Generovat QR platební kód</h2>

        {generalError && <div className="error-message">{generalError}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="acc">Číslo účtu (povinné)</label>
            <input
              type="text"
              id="acc"
              name="acc"
              value={formData.acc}
              onChange={handleChange}
              placeholder="Formát: (000000-)000000000000/0000"
              className={errors.acc ? 'input-error' : ''}
            />
            <small>Formát: 000000-000000000000/0000</small>
            {errors.acc && <div className="field-error">{errors.acc.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="rec">Jméno příjemce</label>
            <input
              type="text"
              id="rec"
              name="rec"
              value={formData.rec}
              onChange={handleChange}
              placeholder="Jméno příjemce (max 250 znaků)"
              maxLength={250}
              className={errors.rec ? 'input-error' : ''}
            />
            <small>Zbývá {recCharsRemaining} znaků</small>
            {errors.rec && <div className="field-error">{errors.rec.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="am">Částka (povinná)</label>
            <input
              type="number"
              id="am"
              name="am"
              value={formData.am}
              onChange={handleChange}
              placeholder="Částka"
              step="0.01"
              min="0.01"
              className={errors.am ? 'input-error' : ''}
            />
            {errors.am && <div className="field-error">{errors.am.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="cc">Měna (povinná)</label>
            <select
              id="cc"
              name="cc"
              value={formData.cc}
              onChange={handleChange}
              required
              className={errors.cc ? 'input-error' : ''}
            >
              <option value="CZK">CZK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
            {errors.cc && <div className="field-error">{errors.cc.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="vs">Variabilní symbol</label>
            <input
              type="text"
              id="vs"
              name="vs"
              value={formData.vs}
              onChange={handleChange}
              placeholder="Max 10 číslic"
              className={errors.vs ? 'input-error' : ''}
            />
            {errors.vs && <div className="field-error">{errors.vs.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="ss">Specifický symbol</label>
            <input
              type="text"
              id="ss"
              name="ss"
              value={formData.ss}
              onChange={handleChange}
              placeholder="Max 10 číslic"
              className={errors.ss ? 'input-error' : ''}
            />
            {errors.ss && <div className="field-error">{errors.ss.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="ks">Konstantní symbol</label>
            <input
              type="text"
              id="ks"
              name="ks"
              value={formData.ks}
              onChange={handleChange}
              placeholder="Max 4 číslice"
              className={errors.ks ? 'input-error' : ''}
            />
            {errors.ks && <div className="field-error">{errors.ks.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="dt">Datum splatnosti</label>
            <input
              type="date"
              id="dt"
              name="dt"
              value={formData.dt ? `${formData.dt.substring(0, 4)}-${formData.dt.substring(4, 6)}-${formData.dt.substring(6, 8)}` : ''}
              onChange={handleChange}
              className={errors.dt ? 'input-error' : ''}
            />
            <small>Vyberte datum splatnosti</small>
            {errors.dt && <div className="field-error">{errors.dt.msg}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="msg">Zpráva</label>
            <input
              type="text"
              id="msg"
              name="msg"
              value={formData.msg}
              onChange={handleChange}
              placeholder="Platební zpráva (max 250 znaků)"
              maxLength={250}
              className={errors.msg ? 'input-error' : ''}
            />
            <small>Zbývá {msgCharsRemaining} znaků</small>
            {errors.msg && <div className="field-error">{errors.msg.msg}</div>}
          </div>

          <button type="submit">
            Generovat QR kód
          </button>
        </form>
      </div>

      <div className="qr-code-container">
        {qrCode ? (
          <div className="qr-result">
            <h3>Váš QR kód</h3>
            <img src={qrCode} alt="QR platební kód"/>
            <p>Naskenujte tento QR kód pomocí vaší bankovní aplikace pro provedení platby.</p>
          </div>
        ) : (
          <div className="qr-code-placeholder">
            <p className="qr-code-placeholder-text">QR kód se zobrazí zde</p>
          </div>
        )}
      </div>
    </div>
  );
};
