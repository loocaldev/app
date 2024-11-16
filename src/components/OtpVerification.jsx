import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const OTPVerification = ({ type }) => {
  const { sendOtp, verifyOtp } = useAuth();
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleSendOtp = async () => {
    setMessage('');
    setError('');
    const response = await sendOtp(type);
    if (response.success) {
      setMessage(response.message);
      setIsOtpSent(true);
    } else {
      setError(response.error);
    }
  };

  const handleVerifyOtp = async () => {
    setMessage('');
    setError('');
    const response = await verifyOtp(type, otp);
    if (response.success) {
      setMessage(response.message);
    } else {
      setError(response.error);
    }
  };

  return (
    <div>
      <button onClick={handleSendOtp}>Enviar código OTP</button>
      {isOtpSent && (
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Ingresa el código OTP"
          />
          <button onClick={handleVerifyOtp}>Verificar OTP</button>
        </div>
      )}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default OTPVerification;
