const fs = require('fs');
let code = fs.readFileSync('src/pages/Checkout.jsx', 'utf8');

// 1. Add correct imports
code = code.replace(
    import { useNavigate } from 'react-router-dom';,
    import { useNavigate } from 'react-router-dom';\nimport QRCode from 'react-qr-code';
);

// 2. Add showPaymentModal state
code = code.replace(
    const [error, setError] = useState('');\n\n    const total = subtotal - discount;,
    const [error, setError] = useState('');\n    const [showPaymentModal, setShowPaymentModal] = useState(false);\n    const [placedOrderId, setPlacedOrderId] = useState(null);\n\n    const total = subtotal - discount;
);

// 3. Update handleSubmit
code = code.replace(
    const { data } = await api.post('/orders', orderData);\n            clearCart();\n            navigate(\/order-success/\\);,
    const { data } = await api.post('/orders', orderData);\n            clearCart();\n            setPlacedOrderId(data.data._id);\n            setShowPaymentModal(true);
);

// 4. Add the Modal before the closing braces
const searchStr =                         </div>\n                    </div>\n                </div>\n            </div>\n        </div>\n    );\n};

let paymentModal = 
            {/* Payment Modal Slider */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-end sm:items-center justify-center animate-fade-in p-4 sm:p-0">
                    <div className="bg-white w-full max-w-md rounded-2xl sm:rounded-xl p-6 relative shadow-2xl animate-slide-up">
                        <h2 className="text-2xl font-typewriter font-bold text-center mb-2">Prescription Ready</h2>
                        <p className="text-center text-gray-600 font-typewriter mb-6">Scan QR to pay securely, or settle at the counter.</p>
                        
                        <div className="bg-gray-50 p-6 rounded-xl flex justify-center mb-6 relative border-2 border-dashed border-therapy-teal">
                            <QRCode 
                                value={\upi://pay?pa=\&pn=CraveTherapy&am=\&cu=INR\} 
                                size={180}
                                level="H"
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-sm shadow-sm scale-150">
                                <span className="text-sm block leading-none"></span>
                            </div>
                        </div>
                        
                        <div className="text-center mb-6">
                            <p className="text-sm text-gray-500 font-typewriter mb-1">Total Amount Due</p>
                            <p className="text-3xl font-bold font-typewriter text-therapy-dark">?{total}</p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex justify-between items-center mb-6">
                            <div className="overflow-hidden mr-2">
                                <p className="text-xs text-blue-600 font-typewriter font-bold mb-0.5">UPI ID</p>
                                <p className="font-typewriter text-sm truncate bg-white px-2 py-0.5 rounded border border-blue-100 inline-block">
                                    {import.meta.env.VITE_UPI_ID || 'testadmin@ybl'}
                                </p>
                            </div>
                            <div className="flex gap-2 shrink-0 h-9">
                                 <button 
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(import.meta.env.VITE_UPI_ID || 'testadmin@ybl');
                                        alert('UPI ID copied to clipboard!');
                                    }} 
                                    className="px-3 bg-white rounded-md shadow-sm border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors flex items-center justify-center text-sm"
                                    title="Copy UPI ID"
                                 >
                                     Copy
                                 </button>
                                 <a 
                                    href={\upi://pay?pa=\&pn=CraveTherapy&am=\&cu=INR\}
                                    className="px-4 bg-blue-600 text-white rounded-md shadow-sm border border-blue-700 hover:bg-blue-700 transition-colors flex items-center justify-center font-bold font-typewriter text-sm"
                                 >
                                     <span className="mr-1">PAY</span> 
                                 </a>
                            </div>
                        </div>

                        <div className="space-y-3 font-typewriter mt-4">
                            <button 
                                onClick={() => navigate(\/order-success/\\)}
                                className="w-full py-4 bg-therapy-teal text-white rounded-xl font-bold hover:bg-therapy-dark transition-colors shadow-lg hover:shadow-xl transform active:scale-95 text-lg"
                            >
                                 I Have Paid via UPI
                            </button>
                            <button 
                                onClick={() => navigate(\/order-success/\\)}
                                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                            >
                                 Pay at Counter Instead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
;

// use regex with \s* to handle line breaks flexibly
code = code.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*}/, paymentModal);

fs.writeFileSync('src/pages/Checkout.jsx', code);
console.log('Done replacement.');
