import { useMemo, useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import Image from "next/image";
import Header from "../header";
import toast from "react-hot-toast";
import QRCode from "qrcode";

const createBillInput = z.object({
    customerName: z.string(),
    date: z.date(),
    totalAmount: z.number(),
    items: z.array(
        z.object({
            name: z.string(),
            quantity: z.number(),
            price: z.number(),
        })
    ),
});

interface BillPreviewProps {
    formValues: z.infer<typeof createBillInput>;
    billCreated?: boolean;
}

// QR Code component using qrcode npm package
type QRCodeProps = {
    value: string;
    size?: number;
};

const QRCodeComponent = ({ value, size = 130 }: QRCodeProps) => {
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const generateQRCode = async () => {
            try {
                setIsLoading(true);
                setError('');

                const dataUrl = await QRCode.toDataURL(value, {
                    width: size,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });

                setQrCodeDataUrl(dataUrl);
            } catch (err) {
                console.error('Error generating QR code:', err);
                setError('Failed to generate QR code');
            } finally {
                setIsLoading(false);
            }
        };

        if (value) {
            void generateQRCode();
        }
    }, [value, size]);

    if (isLoading) {
        return (
            <div
                className="bg-gray-100 border-2 border-gray-300 flex items-center justify-center text-xs text-gray-500 rounded animate-pulse"
                style={{ width: size, height: size }}
            >
                Loading QR...
            </div>
        );
    }

    if (error || !qrCodeDataUrl) {
        return (
            <div
                className="bg-red-50 border-2 border-red-300 flex items-center justify-center text-xs text-red-500 rounded"
                style={{ width: size, height: size }}
            >
                QR Error
            </div>
        );
    }

    return (
        <Image
            src={qrCodeDataUrl}
            alt="QR Code for payment"
            width={size}
            height={size}
            className="border border-gray-300 rounded"
            unoptimized
        />
    );
};

export default function BillPreview({ formValues, billCreated = false }: BillPreviewProps) {
    const [invoiceNumber, setInvoiceNumber] = useState<string>('');

    // Generate invoice number on client side to avoid hydration mismatch
    useEffect(() => {
        setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    }, []);

    const formattedDate = useMemo(() => {
        const date = new Date(formValues.date);
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    }, [formValues.date]);

    const calculateTotalAmount = useMemo(() => {
        return formValues.items.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );
    }, [formValues.items]);

    const handlePrint = () => {
        if (!billCreated) {
            toast.error("Please create the bill first before printing.", { duration: 4000 });
            return;
        }

        const printContent = document.getElementById("bill-preview");
        if (!printContent) {
            toast.error("Could not find the bill content to print.", { duration: 4000 });
            return;
        }

        const printWindow = window.open("", "", "width=800,height=600");
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice ${invoiceNumber}</title>
                        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: 'Sora', sans-serif; 
                                line-height: 1.5;
                                color: #333;
                                background: white;
                                padding: 20px;
                            }
                            .invoice-container { max-width: 600px; margin: 0 auto; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .total { text-align: right; font-weight: bold; margin: 20px 0; }
                            .qr-payment-section { 
                                display: flex; 
                                align-items: center; 
                                gap: 15px; 
                                padding: 15px; 
                                background: #f9fafb; 
                                border-radius: 8px; 
                                border: 1px solid #e5e7eb;
                                margin: 10px 0;
                            }
                            .upi-logo { width: 40px; height: 30px; object-fit: contain; }
                            @media print { 
                                body { -webkit-print-color-adjust: exact; }
                                .qr-payment-section { background: #f9fafb !important; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-container">
                            ${printContent.innerHTML}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            toast.success("Print dialog opened successfully!", { duration: 3000 });
        } else {
            toast.error("Could not open print dialog. Please try again.", { duration: 4000 });
        }
    };

    const upiUrl = `upi://pay?pa=vishnuprintersajekar@paytm&pn=Vishnu%20Printers&am=${calculateTotalAmount.toFixed(2)}&cu=INR&tn=Invoice%20${invoiceNumber}`;

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100">
            <div className="p-6">
                <Header
                    title="Live Preview"
                    subtitle={billCreated ? "Ready to Print" : "Draft"}
                    rightElement={
                        <div className="flex items-center gap-3">
                            {billCreated && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Created
                                </span>
                            )}
                            <Button
                                className={`font-sora font-semibold px-4 py-2 rounded-md transition-all duration-200 ${billCreated
                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                                    }`}
                                onClick={handlePrint}
                                disabled={!billCreated}
                            >
                                Print Invoice
                            </Button>
                        </div>
                    }
                />

                <div
                    id="bill-preview"
                    className="max-w-lg mx-auto bg-white border-2 border-gray-200 shadow-md p-6 rounded-md font-sora mt-6"
                >
                    {/* Header Section */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <div className="flex flex-row items-center gap-3 mb-2">
                                <div>
                                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold font-sora">
                                        VP
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold font-sora">VISHNU PRINTERS</h1>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1 font-sora">
                                <p>+91 9845124879</p>
                                <p>vishnuprintersajekar@gmail.com</p>
                                <p>Milan, Ajekar -574101</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h1 className="text-2xl font-bold font-sora">Invoice</h1>
                            <p className="text-gray-500 text-sm font-sora">{invoiceNumber || 'Loading...'}</p>
                        </div>
                    </div>

                    {/* Billing Information */}
                    <div className="mb-6">
                        <h2 className="font-semibold text-lg mb-2 font-sora">Billing To:</h2>
                        <div className="text-gray-600 space-y-1 font-sora">
                            <p className="font-medium">{formValues.customerName || "Customer Name"}</p>
                            <p>{formattedDate}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-6">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="border border-gray-300 px-2 py-2 text-left font-sora">Description</th>
                                    <th className="border border-gray-300 px-2 py-2 text-center font-sora">Price</th>
                                    <th className="border border-gray-300 px-2 py-2 text-center font-sora">QTY</th>
                                    <th className="border border-gray-300 px-2 py-2 text-right font-sora">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formValues.items.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="border border-gray-300 px-2 py-2 font-sora">
                                            {item.name || `Item ${idx + 1}`}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center font-sora">
                                            ₹{item.price.toFixed(2)}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-center font-sora">
                                            {item.quantity}
                                        </td>
                                        <td className="border border-gray-300 px-2 py-2 text-right font-sora">
                                            ₹{(item.price * item.quantity).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total Section */}
                    <div className="text-right mb-6 space-y-2 font-sora">
                        <div className="flex justify-between border-t pt-3">
                            <span className="font-medium">Subtotal:</span>
                            <span>₹{calculateTotalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600 border-t-2 pt-2">
                            <span>Total:</span>
                            <span>₹{calculateTotalAmount.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer with QR Code */}
                    <hr className="border-gray-400 mb-4" />
                    <div className="flex justify-between items-end">
                        <div className="qr-payment-section">
                            <Image
                                src="/upi.webp"
                                alt="UPI Logo"
                                width={40}
                                height={30}
                                className="upi-logo"
                            />
                            <QRCodeComponent value={upiUrl} size={120} />
                            <div className="text-center">
                                <p className="text-sm text-gray-600 font-sora">
                                    Scan to pay <strong>₹{calculateTotalAmount.toFixed(2)}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="border-t border-gray-400 w-32 mb-2"></div>
                            <p className="text-sm font-medium font-sora">Vishnu Printers Ajekar</p>
                            <p className="text-xs text-gray-500 mt-1 font-sora">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}