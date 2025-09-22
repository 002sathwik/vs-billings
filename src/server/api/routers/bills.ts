import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { createBillInput, updateBills } from "~/zod/billsZ";

export const billRouter = createTRPCRouter({

    newBill: publicProcedure
        .input(createBillInput)
        .mutation(async ({ ctx, input }) => {



            return await ctx.db.bill.create({
                data: {
                    customerName: input.customerName,
                    date: input.date || new Date(),
                    totalAmount: input.totalAmount,
                    items: {
                        create: (input.items ?? []).map(item => ({
                            name: item.name,
                            quantity: item.quantity ?? 1,
                            price: item.price,
                        })),
                    },
                },
            });


        }),

    //update bills
    updatebBill: publicProcedure
        .input(updateBills)
        .mutation(async ({ ctx, input }) => {
            const totalAmount = input.items?.reduce(
                (sum, item) => sum + (item.price * (item.quantity ?? 1)),
                0
            );
            return await ctx.db.bill.update({
                where: {
                    id: input.id
                },
                data: {
                    customerName: input.customerName,
                    date: input.date,
                    totalAmount: totalAmount,
                    items: {
                        create: (input.items ?? []).map(item => ({
                            name: item.name,
                            quantity: item.quantity ?? 1,
                            price: item.price,
                        })),
                    },
                }
            })
        }),


    //delete bill 
    deleteBill: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.bill.delete({
                where: {
                    id: input.id
                }
            })
        }),

    //get all bills
    getAllBills: publicProcedure
        .query(async ({ ctx }) => {
            return await ctx.db.bill.findMany({
                orderBy: {
                    date: 'desc'
                }
            })
        }),


    //get bill by id
    getBillByid: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            return await ctx.db.bill.findUnique({
                where: {
                    id: input.id
                },
                include: {
                    items: true
                }
            })
        })


});



