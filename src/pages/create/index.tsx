import { useMemo, useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { z } from "zod";
import BillPreview from "~/components/bills/BillPreview";
import Header from "~/components/header";
import { Plus, Trash2, Receipt, User, Calendar, DollarSign, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { type ReactNode } from "react";

// Define the `createBillInput` schema
const createBillInput = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    date: z.date(),
    totalAmount: z.number(),
    items: z.array(
        z.object({
            name: z.string().min(1, "Item name is required"),
            quantity: z.number().min(1, "Quantity must be at least 1"),
            price: z.number().min(0.01, "Price must be greater than 0"),
        })
    ).min(1, "At least one item is required"),
});

// Custom Card Component
const CustomCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-100 ${className}`}>
        {children}
    </div>
);

const CustomCardHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
        {children}
    </div>
);

const CustomCardContent = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
);

const CustomCardTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
    <h3 className={`text-lg font-semibold text-gray-900 font-sora ${className}`}>
        {children}
    </h3>
);

// Custom Badge Component
type CustomBadgeProps = {
    children: React.ReactNode;
    variant?: "default" | "secondary" | "success" | "warning" | "error";
    className?: string;
};

const CustomBadge = ({ children, variant = "default", className = "" }: CustomBadgeProps) => {
    const variants = {
        default: "bg-blue-100 text-blue-800",
        secondary: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800"
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-sora ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Custom Loading Spinner Component
type SpinnerSize = "small" | "default" | "large";
const LoadingSpinner = ({ size = "default", className = "" }: { size?: SpinnerSize; className?: string }) => {
    const sizes: Record<SpinnerSize, string> = {
        small: "w-4 h-4",
        default: "w-6 h-6",
        large: "w-8 h-8"
    };

    return (
        <div className={`${sizes[size]} border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin ${className}`} />
    );
};

const CreateBillPage = () => {
    const createNewBill = api.billRouter.newBill.useMutation();
    const [billCreated, setBillCreated] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const [formValues, setFormValues] = useState({
        customerName: "",
        date: new Date(),
        totalAmount: 0,
        items: [{ name: "", quantity: 1, price: 0 }],
    });

    interface FormValues {
        customerName: string;
        date: Date;
        totalAmount: number;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
        }>;
    }

    type Errors = Record<string, string>;

    interface ChangeEvent {
        target: {
            id: string;
            value: string;
        };
    }

    const handleChange = (e: ChangeEvent) => {
        const { id, value } = e.target;
        setFormValues((prevFormValues: FormValues) => ({
            ...prevFormValues,
            [id]: value,
        }));

        // Clear error when user starts typing
        if (errors[id]) {
            setErrors((prev: Errors) => ({ ...prev, [id]: '' }));
        }
    };

    interface DateChangeEvent {
        target: {
            value: string;
        };
    }

    const handleDateChange = (e: DateChangeEvent) => {
        setFormValues((prev) => ({
            ...prev,
            date: new Date(e.target.value),
        }));
    };

    const handleAddItem = () => {
        setFormValues((prevValues) => ({
            ...prevValues,
            items: [...prevValues.items, { name: "", quantity: 1, price: 0 }],
        }));
    };

    type RemoveItemHandler = (index: number) => void;

    const handleRemoveItem: RemoveItemHandler = (index) => {
        if (formValues.items.length > 1) {
            setFormValues((prevValues) => ({
                ...prevValues,
                items: prevValues.items.filter((_, i) => i !== index),
            }));
        }
    };

    const handleItemChange = (
        index: number,
        field: "name" | "quantity" | "price",
        value: string
    ): void => {
        const updatedItems = [...formValues.items];
        const currentItem = updatedItems[index] ?? { name: "", quantity: 1, price: 0 };
        updatedItems[index] = {
            name: field === "name" ? value : currentItem.name,
            quantity: field === "quantity" ? Number(value) || 0 : currentItem.quantity,
            price: field === "price" ? Number(value) || 0 : currentItem.price,
        };

        setFormValues((prevValues) => ({
            ...prevValues,
            items: updatedItems,
        }));

        // Clear item-specific errors
        const errorKey = `item-${index}-${field}`;
        if (errors[errorKey]) {
            setErrors(prev => ({ ...prev, [errorKey]: '' }));
        }
    };

    const calculateTotalAmount = useMemo(() => {
        return formValues.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [formValues.items]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        try {
            createBillInput.parse({
                ...formValues,
                totalAmount: calculateTotalAmount,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach((err) => {
                    const path = err.path.join('-');
                    newErrors[path] = err.message;
                });
            }
        }

        // Additional validation for items
        formValues.items.forEach((item, index) => {
            if (!item.name.trim()) {
                newErrors[`items-${index}-name`] = 'Item name is required';
            }
            if (item.quantity <= 0) {
                newErrors[`items-${index}-quantity`] = 'Quantity must be greater than 0';
            }
            if (item.price <= 0) {
                newErrors[`items-${index}-price`] = 'Price must be greater than 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting.", { duration: 4000 });
            return;
        }

        setIsLoading(true);

        const billData = {
            ...formValues,
            totalAmount: calculateTotalAmount,
        };

        try {
            await createNewBill.mutateAsync(billData);
            setBillCreated(true);
            toast.success("Bill created successfully! You can now print it.", { duration: 4000 });
        } catch (error) {
            toast.error("Failed to create bill. Please try again.", { duration: 4000 });
            console.error("Error creating bill:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Full Width Container */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-8">
                    <Header
                        title="Create New Bill"
                        subtitle="Professional Invoice Generation"
                        rightElement={
                            <div className="flex gap-3">
                                {!billCreated && (
                                    <Button
                                        variant="outline"
                                        onClick={togglePreview}
                                        className="hidden lg:flex items-center gap-2 font-sora"
                                    >
                                        <Receipt size={16} />
                                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                                    </Button>
                                )}
                                <Button
                                    variant={billCreated ? "secondary" : "default"}
                                    className="font-sora font-semibold shadow-lg min-w-[140px]"
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading || billCreated}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <LoadingSpinner size="small" />
                                            Creating...
                                        </div>
                                    ) : billCreated ? (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle size={16} />
                                            Bill Created
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Receipt size={16} />
                                            Create Bill
                                        </div>
                                    )}
                                </Button>
                            </div>
                        }
                    />
                </div>

                {/* Full Width Grid */}
                <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8`}>
                    {/* Form Section - Full Width */}
                    <div className="w-full space-y-6">
                        {/* Customer Information Card */}
                        <CustomCard className="backdrop-blur-sm bg-white/80">
                            <CustomCardHeader>
                                <CustomCardTitle className="flex items-center gap-2 text-slate-800">
                                    <User className="text-blue-600" size={20} />
                                    Customer Information
                                </CustomCardTitle>
                            </CustomCardHeader>
                            <CustomCardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sora">
                                            Customer Name *
                                        </label>
                                        <Input
                                            value={formValues.customerName}
                                            onChange={handleChange}
                                            placeholder="Enter customer name"
                                            id="customerName"
                                            className={`transition-all duration-200 font-sora ${errors.customerName
                                                ? 'border-red-500 focus:ring-red-500'
                                                : 'focus:ring-blue-500 hover:border-blue-300'
                                                }`}
                                        />
                                        {errors.customerName && (
                                            <p className="text-red-500 text-sm mt-1 font-sora">{errors.customerName}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 font-sora">
                                            <Calendar className="inline mr-1" size={16} />
                                            Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={formValues.date.toISOString().split('T')[0]}
                                            onChange={handleDateChange}
                                            className="focus:ring-blue-500 hover:border-blue-300 transition-all duration-200 font-sora"
                                        />
                                    </div>
                                </div>
                            </CustomCardContent>
                        </CustomCard>

                        {/* Items Card */}
                        <CustomCard className="backdrop-blur-sm bg-white/80">
                            <CustomCardHeader>
                                <div className="flex items-center justify-between">
                                    <CustomCardTitle className="flex items-center gap-2 text-slate-800">
                                        <Receipt className="text-blue-600" size={20} />
                                        Invoice Items
                                    </CustomCardTitle>
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600 font-sora"
                                    >
                                        <Plus size={16} />
                                        Add Item
                                    </Button>
                                </div>
                            </CustomCardHeader>
                            <CustomCardContent className="space-y-4">
                                {formValues.items.map((item, index) => (
                                    <div key={index} className="p-4 bg-slate-50/50 border border-slate-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <CustomBadge variant="secondary">
                                                Item #{index + 1}
                                            </CustomBadge>
                                            {formValues.items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 border-red-200 h-8 w-8 p-0"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1 font-sora">
                                                    Item Name *
                                                </label>
                                                <Input
                                                    placeholder="Enter item name"
                                                    value={item.name}
                                                    onChange={(e) => handleItemChange(index, "name", e.target.value)}
                                                    className={`text-sm font-sora ${errors[`items-${index}-name`]
                                                        ? 'border-red-500'
                                                        : 'focus:ring-blue-500'
                                                        }`}
                                                />
                                                {errors[`items-${index}-name`] && (
                                                    <p className="text-red-500 text-xs mt-1 font-sora">
                                                        {errors[`items-${index}-name`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1 font-sora">
                                                    Quantity *
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="Qty"
                                                    value={item.quantity || ''}
                                                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                                    min="1"
                                                    className={`text-sm font-sora ${errors[`items-${index}-quantity`]
                                                        ? 'border-red-500'
                                                        : 'focus:ring-blue-500'
                                                        }`}
                                                />
                                                {errors[`items-${index}-quantity`] && (
                                                    <p className="text-red-500 text-xs mt-1 font-sora">
                                                        {errors[`items-${index}-quantity`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1 font-sora">
                                                    <DollarSign className="inline" size={12} />
                                                    Price *
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={item.price || ''}
                                                    onChange={(e) => handleItemChange(index, "price", e.target.value)}
                                                    step="0.01"
                                                    min="0"
                                                    className={`text-sm font-sora ${errors[`items-${index}-price`]
                                                        ? 'border-red-500'
                                                        : 'focus:ring-blue-500'
                                                        }`}
                                                />
                                                {errors[`items-${index}-price`] && (
                                                    <p className="text-red-500 text-xs mt-1 font-sora">
                                                        {errors[`items-${index}-price`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3 text-right">
                                            <span className="text-sm text-slate-600 font-sora">
                                                Subtotal:
                                                <span className="font-semibold text-slate-800 ml-1">
                                                    ₹{(item.price * item.quantity || 0).toFixed(2)}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CustomCardContent>
                        </CustomCard>

                        {/* Total Card */}
                        <CustomCard className="bg-gradient-to-r from-blue-50 to-indigo-50">
                            <CustomCardContent className="p-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-slate-600 text-sm font-sora">Total Amount</p>
                                        <p className="text-2xl font-bold text-blue-600 font-sora">
                                            ₹{calculateTotalAmount.toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="text-right text-sm text-slate-600 font-sora">
                                        <p>{formValues.items.length} item{formValues.items.length !== 1 ? 's' : ''}</p>
                                        <p>Tax: ₹0.00</p>
                                    </div>
                                </div>
                            </CustomCardContent>
                        </CustomCard>
                    </div>

                    {/* Preview Section - Full Width when shown */}
                    {showPreview && (
                        <div className="w-full lg:sticky lg:top-6 lg:h-fit">
                            <BillPreview formValues={formValues} billCreated={billCreated} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateBillPage;