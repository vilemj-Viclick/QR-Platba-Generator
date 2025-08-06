import { default as express, Request, Response } from 'express';
import { default as bodyParser } from 'body-parser';
import { default as QRCode } from 'qrcode';
import { default as path } from 'path';
import { 
    type QRPlatbaRequest,
    generateQRString, 
    validateQRPlatbaRequest 
} from 'qr-platba-generator';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../app')));

// POST endpoint for QR code generation
app.post('/qr-platba', async (req: Request, res: Response) => {
    try {
        const requestData = req.body as QRPlatbaRequest;
        
        // Validate the request data
        const validationErrors = validateQRPlatbaRequest(requestData);
        
        // If there are any validation errors, return them
        if (validationErrors) {
            return res.status(400).json(validationErrors);
        }

        // Generate QR code string
        const qrString = generateQRString(requestData);

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
