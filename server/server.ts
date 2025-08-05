import { default as express, Request, Response } from 'express';
import { default as bodyParser } from 'body-parser';
import { default as QRCode } from 'qrcode';
import { default as path } from 'path';
import { isValidAccountNumber, isValidDigitString, isValidDate, isValidAmount, isValidCurrency } from './validators';
import { generateQRString, QRPlatbaRequest } from './qrGenerator';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../app')));

// POST endpoint for QR code generation
app.post('/qr-platba', async (req: Request, res: Response) => {
    try {
        const { acc, rec, am, cc, vs, ss, ks, dt, msg } = req.body as QRPlatbaRequest;

        // Validate mandatory fields
        if (!acc) {
            return res.status(400).json({ error: 'Account number (acc) is required' });
        }
        if (!isValidAccountNumber(acc)) {
            return res.status(400).json({ error: 'Invalid account number format. Expected format: 000000-000000000000/0000' });
        }

        if (am === undefined) {
            return res.status(400).json({ error: 'Amount (am) is required' });
        }
        if (!isValidAmount(am)) {
            return res.status(400).json({ error: 'Invalid amount. Must be a positive number' });
        }

        if (!cc) {
            return res.status(400).json({ error: 'Currency (cc) is required' });
        }
        if (!isValidCurrency(cc)) {
            return res.status(400).json({ error: 'Invalid currency code' });
        }

        // Validate optional fields
        if (vs && !isValidDigitString(vs, 10)) {
            return res.status(400).json({ error: 'Invalid variable symbol. Must be a string of digits, max 10 characters' });
        }

        if (ss && !isValidDigitString(ss, 10)) {
            return res.status(400).json({ error: 'Invalid specific symbol. Must be a string of digits, max 10 characters' });
        }

        if (ks && !isValidDigitString(ks, 4)) {
            return res.status(400).json({ error: 'Invalid constant symbol. Must be a string of digits, max 4 characters' });
        }

        if (dt && !isValidDate(dt)) {
            return res.status(400).json({ error: 'Invalid date format. Expected format: YYYYMMDD' });
        }

        // Generate QR code string
        const qrString = generateQRString(req.body as QRPlatbaRequest);

        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(qrString);

        // Return QR code
        res.json({
            qrCode: qrCodeDataURL,
            qrString: qrString
        });
    } catch (error) {
        console.error('Error generating QR code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Catch-all route to serve the React app
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../app/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`QR code generator server running on port ${port}`);
});
