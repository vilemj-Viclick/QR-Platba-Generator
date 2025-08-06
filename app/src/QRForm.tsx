import React, {useState} from 'react';
import QRCode from 'qrcode';
import {generateQRString, QRPlatbaRequest, validateQRPlatbaRequest} from 'qr-platba-generator';

type FormData = {
  [key in keyof QRPlatbaRequest]: string;
};

// Interface for field-specific errors
interface FieldErrors {
  [key: string]: string;
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
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));

    // Clear error for this field when user starts typing
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
    setLoading(true);

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
      setGeneralError('An unexpected error occurred while generating the QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-form-container">
      <div className="qr-form-wrapper">
        <h2>Generate QR Payment Code</h2>

        {generalError && <div className="error-message">{generalError}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="acc">Account Number (required)</label>
            <input
              type="text"
              id="acc"
              name="acc"
              value={formData.acc}
              onChange={handleChange}
              placeholder="Format: (000000-)000000000000/0000"
              required
              className={errors.acc ? 'input-error' : ''}
            />
            <small>Format: 000000-000000000000/0000</small>
            {errors.acc && <div className="field-error">{errors.acc}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="rec">Recipient Name</label>
            <input
              type="text"
              id="rec"
              name="rec"
              value={formData.rec}
              onChange={handleChange}
              placeholder="Recipient name"
              className={errors.rec ? 'input-error' : ''}
            />
            {errors.rec && <div className="field-error">{errors.rec}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="am">Amount (required)</label>
            <input
              type="number"
              id="am"
              name="am"
              value={formData.am}
              onChange={handleChange}
              placeholder="Amount"
              step="0.01"
              min="0.01"
              required
              className={errors.am ? 'input-error' : ''}
            />
            {errors.am && <div className="field-error">{errors.am}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="cc">Currency (required)</label>
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
            {errors.cc && <div className="field-error">{errors.cc}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="vs">Variable Symbol</label>
            <input
              type="text"
              id="vs"
              name="vs"
              value={formData.vs}
              onChange={handleChange}
              placeholder="Max 10 digits"
              pattern="\d{0,10}"
              className={errors.vs ? 'input-error' : ''}
            />
            {errors.vs && <div className="field-error">{errors.vs}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="ss">Specific Symbol</label>
            <input
              type="text"
              id="ss"
              name="ss"
              value={formData.ss}
              onChange={handleChange}
              placeholder="Max 10 digits"
              pattern="\d{0,10}"
              className={errors.ss ? 'input-error' : ''}
            />
            {errors.ss && <div className="field-error">{errors.ss}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="ks">Constant Symbol</label>
            <input
              type="text"
              id="ks"
              name="ks"
              value={formData.ks}
              onChange={handleChange}
              placeholder="Max 4 digits"
              pattern="\d{0,4}"
              className={errors.ks ? 'input-error' : ''}
            />
            {errors.ks && <div className="field-error">{errors.ks}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="dt">Due Date</label>
            <input
              type="text"
              id="dt"
              name="dt"
              value={formData.dt}
              onChange={handleChange}
              placeholder="Format: YYYYMMDD"
              pattern="\d{8}"
              className={errors.dt ? 'input-error' : ''}
            />
            <small>Format: YYYYMMDD</small>
            {errors.dt && <div className="field-error">{errors.dt}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="msg">Message</label>
            <input
              type="text"
              id="msg"
              name="msg"
              value={formData.msg}
              onChange={handleChange}
              placeholder="Payment message"
              className={errors.msg ? 'input-error' : ''}
            />
            {errors.msg && <div className="field-error">{errors.msg}</div>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>

      <div className="qr-code-container">
        {qrCode ? (
          <div className="qr-result">
            <h3>Your QR Code</h3>
            <img src={qrCode} alt="QR Payment Code"/>
            <p>Scan this QR code with your banking app to make the payment.</p>
          </div>
        ) : (
          <div className="qr-code-placeholder">
            <p className="qr-code-placeholder-text">QR code will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRForm;
