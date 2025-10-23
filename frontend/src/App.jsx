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
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

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
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Header with improved animation */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl animate-pulse"></div>
              <div className="absolute inset-1 bg-slate-900 rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            CryptoWinUFM
          </h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-3">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <p className="text-sm text-gray-300 font-medium">Sepolia Testnet Faucet</p>
          </div>
          <p className="text-base text-gray-400 mt-2">Recibe <span className="text-purple-400 font-semibold">0.01 SepoliaETH</span> cada 24 horas</p>
        </div>

        {/* Main Card with improved design */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl border border-white/10 backdrop-blur-xl animate-slide-up">
          {/* Wallet Input */}
          <div className="mb-6">
            <label htmlFor="wallet" className="block text-sm font-semibold mb-3 text-gray-200 flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              Dirección de Wallet
            </label>
            <div className="relative group">
              <input
                id="wallet"
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value.trim())}
                placeholder="0x..."
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500 transition-all duration-300 font-mono text-sm group-hover:border-white/20"
              />
              {hasValidAddress && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-green-400 animate-fade-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              )}
            </div>
            {walletAddress && !hasValidAddress && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-400 animate-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Dirección de wallet inválida
              </div>
            )}
          </div>

          {/* Claim Button with enhanced design */}
          <button
            onClick={handleClaim}
            disabled={loading || !hasValidAddress || !isEligible}
            className="w-full py-5 px-6 button-primary rounded-xl font-bold text-white text-lg shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:shadow-none relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span>Obtener Recompensa</span>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          {/* Last Transaction with enhanced animation */}
          {lastTransaction && (
            <div className="mt-6 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl border-2 border-green-500/30 animate-fade-in-scale">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-3 animate-bounce-slow">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p className="text-green-400 font-bold text-lg mb-2">¡Transacción Exitosa!</p>
                <p className="text-gray-200 text-base mb-4 font-medium">
                  <span className="text-green-300">{lastTransaction.amount} SepoliaETH</span> enviados
                </p>
                <a
                  href={`https://sepolia.etherscan.io/tx/${lastTransaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 rounded-xl text-green-300 hover:text-green-200 transition-all text-sm font-semibold group border border-green-500/30 hover:border-green-500/50"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  Ver en Etherscan
                </a>
                <details className="mt-4 text-left">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                    Ver hash completo
                  </summary>
                  <p className="text-xs text-gray-500 mt-2 font-mono break-all bg-black/20 p-3 rounded-lg">
                    {lastTransaction.hash}
                  </p>
                </details>
              </div>
            </div>
          )}

          {/* Eligibility Status with better design */}
          {hasValidAddress && eligibilityData && (
            <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm animate-fade-in">
              {eligibilityData.eligible && timeRemaining <= 0 ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/20 rounded-2xl mb-3 animate-pulse">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-green-400 font-bold text-lg">¡Puedes reclamar tu recompensa!</p>
                </div>
              ) : eligibilityData.nextClaimTime ? (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-yellow-500/20 rounded-2xl mb-3">
                    <svg className="w-7 h-7 text-yellow-400 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <p className="text-gray-200 mb-3 font-medium">Próxima reclamación disponible en:</p>
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/20 mb-3">
                    <p className="text-4xl font-black text-yellow-400 font-mono tracking-wider">
                      {formatTimeRemaining(timeRemaining)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Última reclamación: <span className="text-gray-300 font-medium">{new Date(eligibilityData.lastClaimTime).toLocaleString('es-GT', { timeZone: 'America/Guatemala' })}</span>
                  </p>
                </div>
              ) : checkingEligibility ? (
                <div className="text-center text-gray-400">
                  <div className="animate-pulse">Verificando elegibilidad...</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-green-500/20 rounded-2xl mb-3">
                    <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <p className="text-green-400 font-bold text-lg">Primera reclamación disponible</p>
                </div>
              )}
            </div>
          )}

          {/* Info Section with improved layout */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 hover:border-blue-500/20 transition-colors group">
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-200 font-semibold text-sm">Límite de reclamación</p>
                  <p className="text-gray-400 text-xs mt-1">Una vez cada 24 horas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 hover:border-purple-500/20 transition-colors group">
                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                  </svg>
                </div>
                <div>
                  <p className="text-gray-200 font-semibold text-sm">Cantidad por reclamación</p>
                  <p className="text-gray-400 text-xs mt-1">0.01 SepoliaETH</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center animate-fade-in animation-delay-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-sm text-gray-400">Solo para Sepolia Testnet - No tiene valor real</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
