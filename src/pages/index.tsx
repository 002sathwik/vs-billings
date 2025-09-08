import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "~/components/header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import {
  CalendarIcon,
  UserIcon,
  IndianRupeeIcon,
  EyeIcon,
  SearchIcon,
  PrinterIcon,
  DownloadIcon,
  XIcon,
  PackageIcon
} from "lucide-react";

// Types
interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Bill {
  id: string;
  customerName: string;
  date: string | Date;
  totalAmount: number;
  items?: BillItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: string;
  icon?: React.ReactNode;
}

interface BillRowProps {
  bill: Bill;
  onView: () => void;
}

interface BillDetailDialogProps {
  bill: Bill | null | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const StatsCard = ({ title, value, subtitle, color, icon }: StatsCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 font-sora">{title}</p>
        <p className={`text-2xl font-bold ${color} font-grotesk`}>{value}</p>
        <p className="text-xs text-gray-500 font-sora mt-1">{subtitle}</p>
      </div>
      <div className={`w-12 h-12 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')} flex items-center justify-center flex-shrink-0`}>
        {icon ?? <IndianRupeeIcon className={`w-6 h-6 ${color}`} />}
      </div>
    </div>
  </div>
);

// Bill Row Component
const BillRow = ({ bill, onView }: BillRowProps) => {
  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300">
      <div className="flex items-center justify-between">
        {/* Customer Info */}
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 font-sora truncate">{bill.customerName}</h3>
            <div className="flex items-center text-sm text-gray-500 font-sora mt-1">
              <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{formatDate(bill.date)}</span>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="text-right mr-4 flex-shrink-0">
          <p className="text-lg font-bold text-gray-900 font-grotesk">₹{bill.totalAmount.toFixed(2)}</p>
          <Badge variant="outline" className="text-xs">
            #{bill.id.slice(0, 8)}
          </Badge>
        </div>

        {/* View Button */}
        <Button
          onClick={onView}
          variant="outline"
          size="sm"
          className="font-sora hover:bg-blue-50 hover:border-blue-300 flex-shrink-0"
        >
          <EyeIcon className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>
    </div>
  );
};

// Bill Detail Dialog Component
const BillDetailDialog = ({ bill, isOpen, onClose }: BillDetailDialogProps) => {
  if (!bill) return null;

  const formatDate = (date: string | Date) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a downloadable invoice
    const element = document.getElementById('invoice-content');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${bill.id}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; font-weight: bold; margin-top: 20px; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold font-sora flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              VP
            </div>
            Invoice Details
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              className="font-sora"
            >
              <PrinterIcon className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="font-sora"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    VP
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-sora">VISHNU PRINTERS</h1>
                    <p className="text-sm text-gray-600 font-sora">Professional Printing Services</p>
                  </div>
                </div>
                <div className="text-sm text-gray-600 space-y-1 font-sora">
                  <p className="flex items-center gap-2">
                    <span>📞</span> +91 9845124879
                  </p>
                  <p className="flex items-center gap-2">
                    <span>✉️</span> vishnuprintersajekar@gmail.com
                  </p>
                  <p className="flex items-center gap-2">
                    <span>📍</span> Milan, Ajekar - 574101
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-bold text-blue-600 font-grotesk">INVOICE</h2>
                <p className="text-lg text-gray-600 font-sora mt-2">#{bill.id.slice(0, 8)}</p>
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-sm text-gray-500 font-sora">Issue Date</p>
                  <p className="font-semibold text-gray-900 font-sora">{formatDate(bill.date)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 font-sora flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Bill To
            </h3>
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-xl font-semibold text-gray-900 font-sora">{bill.customerName}</p>
              <p className="text-gray-600 font-sora mt-1">Customer</p>
            </div>
          </div>

          {/* Items Table */}
          {bill.items && bill.items.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold mb-4 font-sora flex items-center gap-2">
                <PackageIcon className="w-5 h-5 text-blue-600" />
                Items & Services
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 font-sora">Description</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 font-sora">Quantity</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-sora">Unit Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 font-sora">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bill.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 font-sora font-medium">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-sora text-center">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-sora text-right">₹{item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 font-sora text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <PackageIcon className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <p className="text-yellow-800 font-sora">No items found for this invoice</p>
            </div>
          )}

          {/* Total Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-end">
              <div className="w-80">
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-sora">Subtotal:</span>
                    <span className="font-semibold font-grotesk">₹{bill.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t">
                    <span className="text-gray-600 font-sora">Tax (0%):</span>
                    <span className="font-semibold font-grotesk">₹0.00</span>
                  </div>
                  <div className="flex justify-between py-3 border-t-2 border-gray-300">
                    <span className="text-xl font-bold text-gray-900 font-sora">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-600 font-grotesk">₹{bill.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-blue-50 rounded-lg p-6 text-center border border-blue-200">
            <h4 className="font-bold text-gray-900 font-sora mb-3">Thank you for your business!</h4>
            <div className="text-sm text-gray-600 font-sora">
              <p className="mb-2">For any queries regarding this invoice, please contact us at:</p>
              <p className="font-semibold">+91 9845124879 | vishnuprintersajekar@gmail.com</p>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="w-32 mx-auto border-t-2 border-gray-400 mb-2"></div>
              <p className="text-sm font-medium text-gray-700 font-sora">Authorized Signature</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Home() {
  const { data, isLoading, error } = api.billRouter.getAllBills.useQuery();
  const bills = useMemo(
    () =>
      (data ?? []).map((bill) => ({
        ...bill,
        id: bill.id.toString(),
      })) as Bill[],
    [data]
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Get bill details when viewing
  const { data: billDetails } = api.billRouter.getBillByid.useQuery(
    { id: Number(selectedBill?.id)},
    { enabled: !!selectedBill?.id }
  );

  const filteredBills = useMemo(() => {
    if (!bills.length) return [];

    return bills.filter((bill) => {
      const searchLower = searchTerm.toLowerCase();
      const dateStr = new Date(bill.date).toLocaleDateString();
      return (
        bill.customerName.toLowerCase().includes(searchLower) ||
        dateStr.includes(searchLower) ||
        bill.id.toLowerCase().includes(searchLower)
      );
    });
  }, [bills, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!bills.length) {
      return {
        totalBills: 0,
        totalAmount: 0,
        thisMonth: 0,
        avgAmount: 0
      };
    }

    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const now = new Date();
    const thisMonth = bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalBills: bills.length,
      totalAmount,
      thisMonth,
      avgAmount: totalAmount / bills.length
    };
  }, [bills]);

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedBill(null);
  };

  if (error) {
    return (
      <div className="w-full h-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-red-600 font-sora mb-2">Error loading bills</h2>
          <p className="text-gray-600 font-sora">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-50 min-h-screen">
      <div className="p-8">
        <Header
          title="Invoice Bills"
          subtitle="Manage and view all your bills"
          rightElement={
            <Link href="/create">
              <Button className="bg-blue-600 hover:bg-blue-700 font-sora transition-colors">
                Create New Bill
              </Button>
            </Link>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatsCard
            title="Total Bills"
            value={stats.totalBills.toString()}
            subtitle="All time"
            color="text-blue-600"
            icon={<UserIcon className="w-6 h-6 text-blue-600" />}
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            subtitle="All time earnings"
            color="text-green-600"
            icon={<IndianRupeeIcon className="w-6 h-6 text-green-600" />}
          />
          <StatsCard
            title="This Month"
            value={stats.thisMonth.toString()}
            subtitle="Bills created"
            color="text-purple-600"
            icon={<CalendarIcon className="w-6 h-6 text-purple-600" />}
          />
          <StatsCard
            title="Average Bill"
            value={`₹${stats.avgAmount.toFixed(0)}`}
            subtitle="Per invoice"
            color="text-orange-600"
            icon={<PackageIcon className="w-6 h-6 text-orange-600" />}
          />
        </div>

        {/* Search Bar */}
        <div className="mt-8">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, date, or invoice number..."
              className="font-sora pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 font-sora mt-4">Loading bills...</p>
          </div>
        )}

        {/* Bills List */}
        {!isLoading && (
          <div className="mt-8">
            {filteredBills.length > 0 ? (
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <BillRow
                    key={bill.id}
                    bill={bill}
                    onView={() => handleViewBill(bill)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <div className="text-6xl text-gray-300 mb-4 font-grotesk">📄</div>
                <h3 className="text-xl text-gray-500 font-grotesk mb-2">No Bills Found</h3>
                <p className="text-gray-400 font-sora mb-6">
                  {searchTerm
                    ? `No bills found matching "${searchTerm}"`
                    : "Create your first bill to get started"
                  }
                </p>
                {!searchTerm && (
                  <Link href="/create">
                    <Button className="bg-blue-600 hover:bg-blue-700 font-sora">
                      Create Your First Bill
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bill Detail Dialog */}
        <BillDetailDialog
          bill={
            billDetails
              ? {
                  ...billDetails,
                  id: billDetails.id.toString(),
                  items: billDetails.items
                    ? billDetails.items.map(item => ({
                        ...item,
                        id: item.id.toString(),
                      }))
                    : [],
                }
              : null
          }
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
        />
      </div>
    </div>
  );
}