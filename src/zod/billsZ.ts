import { z } from "zod";

const createBillInput = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    date: z.date(),
    totalAmount: z.number().min(0, "Total amount cannot be negative"),
    items: z.array(
        z.object({
            name: z.string().min(1, "Item name is required"),
            quantity: z.number().optional(),
            price: z.number().min(0, "Price cannot be negative"),
        })
    ),
});
const updateBills = z.object({
    id: z.number(),
    customerName: z.string().min(1, "Customer name is required").optional(),
    date: z.date().optional(),
    totalAmount: z.number().min(0, "Total amount cannot be negative"),
    items: z.array(
        z.object({
            name: z.string().min(1, "Item name is required"),
            quantity: z.number().optional(),
            price: z.number().min(0, "Price cannot be negative"),
        })
    ).optional(),
});


export { createBillInput, updateBills };

