// Utility to load Razorpay script dynamically
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay checkout
export const initiateRazorpayPayment = async (options) => {
  const isScriptLoaded = await loadRazorpayScript();
  
  if (!isScriptLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(response.error);
    });
    rzp.open();
    resolve(rzp);
  });
};
