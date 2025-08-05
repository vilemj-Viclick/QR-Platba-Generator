import React, { useState } from 'react';
import axios from 'axios';

interface FormData {
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

interface QRResponse {
  qrCode: string;
  qrString: string;
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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setQrCode(null);
    setLoading(true);

    try {
      // Convert amount to number
      const payload = {
        ...formData,
        am: parseFloat(formData.am)
      };

      const response = await axios.post<QRResponse>('/qr-platba', payload);
      setQrCode(response.data.qrCode);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'An error occurred');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error generating QR code:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-form-container">
      <h2>Generate QR Payment Code</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="acc">Account Number (required)</label>
          <input
            type="text"
            id="acc"
            name="acc"
            value={formData.acc}
            onChange={handleChange}
            placeholder="Format: 000000-000000000000/0000"
            required
          />
          <small>Format: 000000-000000000000/0000</small>
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
          />
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="cc">Currency (required)</label>
          <select
            id="cc"
            name="cc"
            value={formData.cc}
            onChange={handleChange}
            required
          >
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
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
          />
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
          />
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
          />
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
          />
          <small>Format: YYYYMMDD</small>
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
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate QR Code'}
        </button>
      </form>

      {qrCode && (
        <div className="qr-result">
          <h3>Your QR Code</h3>
          <img src={qrCode} alt="QR Payment Code" />
          <p>Scan this QR code with your banking app to make the payment.</p>
        </div>
      )}
    </div>
  );
};

export default QRForm;
