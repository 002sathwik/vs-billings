

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

const QRCodeComponent = ({ value, size = 100 }: QRCodeProps) => {
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
                className="bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-500 rounded"
                style={{ width: size, height: size }}
            >
                Loading...
            </div>
        );
    }

    if (error || !qrCodeDataUrl) {
        return (
            <div
                className="bg-red-50 border border-red-300 flex items-center justify-center text-xs text-red-500 rounded"
                style={{ width: size, height: size }}
            >
                Error
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

    // Calculate total amount
    const calculateTotalAmount = useMemo(() => {
        return formValues.items.reduce(
            (total, item) => total + (item.price || 0),
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
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>Invoice ${invoiceNumber}</title>
                        <style>
                            @page {
                                size: A4;
                                margin: 20mm;
                            }
                            
                            * { 
                                margin: 0; 
                                padding: 0; 
                                box-sizing: border-box; 
                            }
                            
                            body { 
                                font-family: Arial, sans-serif;
                                font-size: 12px;
                                line-height: 1.5;
                                color: #000;
                                background: white;
                            }
                            
                            .invoice-container { 
                                max-width: 100%; 
                                margin: 0 auto;
                                background: white;
                                padding: 20px;
                            }
                            
                            /* Header - Simple */
                            .invoice-container > div {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-start;
                                margin-bottom: 30px;
                            }
                            
                            h1 {
                                font-size: 18px;
                                font-weight: normal;
                                margin-bottom: 8px;
                            }
                            
                            h2 {
                                font-size: 24px;
                                font-weight: normal;
                                margin-bottom: 8px;
                            }
                            
                            /* Simple line separator */
                            .invoice-container .border-t {
                                border-top: 1px solid #ccc;
                                margin: 20px 0;
                            }
                            
                            /* Table - Clean and Simple */
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 20px 0;
                            }
                            
                            th {
                                padding: 8px 4px;
                                text-align: left;
                                font-size: 11px;
                                font-weight: normal;
                                border-bottom: 1px solid #666;
                                text-transform: uppercase;
                            }
                            
                            th:nth-child(2), th:nth-child(3) { text-align: center; }
                            th:nth-child(4) { text-align: right; }
                            
                            td {
                                padding: 10px 4px;
                                font-size: 11px;
                                border-bottom: 1px solid #ddd;
                            }
                            
                            td:nth-child(2), td:nth-child(3) { text-align: center; }
                            td:nth-child(4) { text-align: right; }
                            
                            /* Totals - Right aligned, simple */
                            .invoice-container .flex.justify-end {
                                display: flex;
                                justify-content: flex-end;
                                margin: 20px 0;
                            }
                            
                            .invoice-container .w-64 {
                                width: 250px;
                            }
                            
                            .invoice-container .flex.justify-between {
                                display: flex;
                                justify-content: space-between;
                                padding: 4px 0;
                            }
                            
                            /* Footer - Payment and Signature */
                            .invoice-container > div:last-child .flex.justify-between {
                                display: flex;
                                justify-content: space-between;
                                align-items: flex-end;
                                margin-top: 40px;
                            }
                            
                            .invoice-container .text-right {
                                text-align: right;
                            }
                            
                            .invoice-container .w-32 {
                                width: 120px;
                                border-bottom: 1px solid #000;
                                margin-bottom: 8px;
                            }
                            
                            /* Print specific */
                            @media print {
                                body { 
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                                
                                .invoice-container {
                                    width: 100% !important;
                                    max-width: none !important;
                                }
                                
                                .header, .bill-to, .qr-section {
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                                
                                th {
                                    background: #000 !important;
                                    color: white !important;
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                                
                                tbody tr:nth-child(even) {
                                    background: #f8f8f8 !important;
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
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

            setTimeout(() => {
                printWindow.print();
                toast.success("Print dialog opened successfully!", { duration: 3000 });
            }, 500);
        } else {
            toast.error("Could not open print dialog. Please try again.", { duration: 4000 });
        }
    };

    // const upiUrl = `upi://pay?pa=vishnuprintersajekar@paytm&pn=Vishnu%20Printers&am=${calculateTotalAmount.toFixed(2)}&cu=INR&tn=Invoice%20${invoiceNumber}`;
    const upiUrl = `upi://pay?pa=gpay-11209931560@okbizaxis&pn=Merchant&am=${calculateTotalAmount.toFixed(2)}&cu=INR&tn=Invoice%20${invoiceNumber}`;
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
                                className={`font-semibold px-4 py-2 rounded-md transition-all duration-200 ${billCreated
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
                    className="max-w-2xl mx-auto bg-white p-8 mt-6 font-sora"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-2xl font-normal mb-2">VISHNU PRINTERS</h1>
                            <div className="text-sm text-gray-700 space-y-1">
                                <div>+91 9845124879</div>
                                <div>vishnuprintersajekar@gmail.com</div>
                                <div>Pragathi Ganesh Trade Center, Ajekar - 574101</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-normal mb-2">INVOICE</h2>
                            <div className="text-sm text-gray-600">
                                Invoice no: {invoiceNumber || 'Loading...'}
                            </div>

                            <div className="text-sm text-gray-600">
                                Issue date: {formattedDate}
                            </div>
                        </div>
                    </div>

                    {/* Simple line separator */}
                    <div className="text-sm text-gray-600 font-sora">
                        Issued for: {formValues.customerName || "Customer Name"}
                    </div>
                    <div className="border-t border-gray-300 mb-6"></div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-gray-400">
                                <th className="text-left py-2 font-normal text-sm">DESCRIPTION</th>
                                <th className="text-center py-2 font-normal text-sm w-16">QTY</th>
                                <th className="text-center py-2 font-normal text-sm w-20">PRICE</th>
                                <th className="text-right py-2 font-normal text-sm w-24">SUBTOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Render actual items */}
                            {formValues.items.map((item, idx) => (
                                <tr key={idx} className="border-b border-gray-200">
                                    <td className="py-3 text-sm">{item.name || `Item ${idx + 1}`}</td>
                                    <td className="py-3 text-center text-sm">{item.quantity}</td>
                                    <td className="py-3 text-center text-sm">₹{(item.price || 0).toFixed(2)}</td>
                                    <td className="py-3 text-right text-sm">₹{(item.price || 0).toFixed(2)}</td>
                                </tr>
                            ))}
                            {/* Fill remaining rows to make 6 total rows */}
                            {Array.from({ length: Math.max(0, 6 - formValues.items.length) }, (_, idx) => (
                                <tr key={`empty-${idx}`} className="border-b border-gray-200">
                                    <td className="py-3 text-sm">&nbsp;</td>
                                    <td className="py-3 text-center text-sm">&nbsp;</td>
                                    <td className="py-3 text-center text-sm">&nbsp;</td>
                                    <td className="py-3 text-right text-sm">&nbsp;</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64">
                            <div className="flex justify-between py-1 border-b border-gray-200">
                                <span className="text-sm">SUBTOTAL:</span>
                                <span className="text-sm">₹{calculateTotalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b-2 border-gray-800 font-medium">
                                <span className="text-sm">GRAND TOTAL:</span>
                                <span className="text-sm">₹{calculateTotalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info and Signature */}
                    <div className="flex justify-between items-end mt-12">
                        <div className="flex-1 max-w-md">
                            <div className="text-sm font-medium mb-3 text-gray-800">Payment info:</div>
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <QRCodeComponent value={upiUrl} size={80} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-800 mb-1">
                                            Scan QR Code to Pay
                                        </div>
                                        <div className="text-lg font-semibold text-blue-600 mb-2">
                                            ₹{calculateTotalAmount.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-sm font-medium text-gray-700 mb-2">Bank Details:</div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex justify-between">
                                            <span className="font-medium">Bank:</span>
                                            <span>Union Bank of India Ajekar</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">A/c No:</span>
                                            <span className="font-mono">560371000497103</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">IFSC:</span>
                                            <span className="font-mono">UBIN0900982</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right ml-8 mt-28">
                            <div className="w-32 border-b border-gray-800 mb-3"></div>
                            <div className="text-sm font-medium">Vishnu Printers</div>
                            <div className="text-xs text-gray-600 mt-1">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}