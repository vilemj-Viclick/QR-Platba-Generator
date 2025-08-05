import React from 'react';
import { QRForm } from './QRForm';

export const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1>QR Platba Generator</h1>
      </header>
      <main>
        <QRForm />
      </main>
      <footer>
        <p>QR code generator for Czech payment system</p>
      </footer>
    </div>
  );
};
