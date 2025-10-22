import { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { isValidEthereumAddress, formatTimeRemaining } from './utils/validation';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Check eligibility when wallet address is valid
  useEffect(() => {
    if (isValidEthereumAddress(walletAddress)) {
      checkEligibility(walletAddress);
    } else {
      setEligibilityData(null);
      setTimeRemaining(0);
    }
  }, [walletAddress]);

  // Update countdown timer every second
  useEffect(() => {
    if (!eligibilityData) return;

    const interval = setInterval(() => {
      if (eligibilityData.nextClaimTime) {
        const remaining = new Date(eligibilityData.nextClaimTime).getTime() - Date.now();
        setTimeRemaining(remaining > 0 ? remaining : 0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [eligibilityData]);

  const checkEligibility = async (address) => {
    if (!isValidEthereumAddress(address)) return;

    setCheckingEligibility(true);
    try {
      const response = await axios.get(`${API_URL}/api/check-eligibility/${address}`);
      setEligibilityData(response.data);
      
      if (response.data.nextClaimTime) {
        const remaining = new Date(response.data.nextClaimTime).getTime() - Date.now();
        setTimeRemaining(remaining > 0 ? remaining : 0);
      } else {
        setTimeRemaining(0);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityData(null);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleClaim = async () => {
    if (!isValidEthereumAddress(walletAddress)) {
      toast.error('Por favor ingresa una dirección de wallet válida');
      return;
    }

    if (!eligibilityData?.eligible) {
      toast.error('Debes esperar 24 horas desde tu última reclamación');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Procesando tu recompensa...');

    try {
      const response = await axios.post(`${API_URL}/api/claim`, {
        walletAddress: walletAddress,
      });

      toast.dismiss(loadingToast);
      
      if (response.data.success) {
        // Guardar la transacción
        setLastTransaction({
          hash: response.data.transactionHash,
          amount: response.data.amount,
          timestamp: new Date().toISOString()
        });
        
        toast.success(
          <div>
            <p className="font-bold">¡Recompensa enviada exitosamente!</p>
            <p className="text-sm mt-1">0.01 SepoliaETH enviados</p>
            <a 
              href={`https://sepolia.etherscan.io/tx/${response.data.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 hover:text-blue-200 text-xs underline mt-1 block"
            >
              Ver transacción en Etherscan
            </a>
          </div>,
          { duration: 8000 }
        );
        
        // Refresh eligibility after successful claim
        setTimeout(() => checkEligibility(walletAddress), 1000);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      
      const errorMessage = error.response?.data?.error || 'Error al procesar la solicitud';
      toast.error(
        <div>
          <p className="font-bold">Error</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const isEligible = eligibilityData?.eligible && timeRemaining <= 0;
  const hasValidAddress = isValidEthereumAddress(walletAddress);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'glass-effect',
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
          },
        }}
      />
      
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Cryptowinufm
          </h1>
          <p className="text-xl text-gray-300">Sepolia Testnet Faucet</p>
          <p className="text-sm text-gray-400 mt-2">Recibe 0.01 SepoliaETH cada 24 horas</p>
        </div>

        {/* Main Card */}
        <div className="glass-effect rounded-2xl p-8 shadow-2xl">
          {/* Wallet Input */}
          <div className="mb-6">
            <label htmlFor="wallet" className="block text-sm font-medium mb-2 text-gray-300">
              Dirección de Wallet
            </label>
            <input
              id="wallet"
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value.trim())}
              placeholder="0x..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition-all"
            />
            {walletAddress && !hasValidAddress && (
              <p className="mt-2 text-sm text-red-400">
                Dirección de wallet inválida
              </p>
            )}
          </div>

          {/* Claim Button */}
          <button
            onClick={handleClaim}
            disabled={loading || !hasValidAddress || !isEligible}
            className="w-full py-4 px-6 button-primary rounded-lg font-semibold text-white shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Obtener Recompensa'
            )}
          </button>

          {/* Last Transaction */}
          {lastTransaction && (
            <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <p className="text-green-400 font-semibold mb-2">¡Transacción exitosa!</p>
                <p className="text-gray-300 text-sm mb-3">
                  {lastTransaction.amount} SepoliaETH enviados
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${lastTransaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-300 hover:text-green-200 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Ver en Etherscan
                </a>
                <p className="text-xs text-gray-500 mt-2 font-mono break-all">
                  {lastTransaction.hash}
                </p>
              </div>
            </div>
          )}

          {/* Eligibility Status */}
          {hasValidAddress && eligibilityData && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              {eligibilityData.eligible && timeRemaining <= 0 ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-green-400 font-semibold">¡Puedes reclamar tu recompensa!</p>
                </div>
              ) : eligibilityData.nextClaimTime ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-300 mb-2">Tiempo restante para próxima reclamación:</p>
                  <p className="text-3xl font-bold text-yellow-400 font-mono">
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Última reclamación: {new Date(eligibilityData.lastClaimTime).toLocaleString('es-GT', { timeZone: 'America/Guatemala' })}
                  </p>
                </div>
              ) : checkingEligibility ? (
                <div className="text-center text-gray-400">
                  <p>Verificando elegibilidad...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-2">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-green-400 font-semibold">Primera reclamación disponible</p>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                  <p className="text-gray-300">Límite de reclamación</p>
                  <p className="text-gray-400">Una vez cada 24 horas</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                <div>
                  <p className="text-gray-300">Cantidad por reclamación</p>
                  <p className="text-gray-400">0.01 SepoliaETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>Solo para Sepolia Testnet - No tiene valor real</p>
        </div>
      </div>
    </div>
  );
}

export default App;



