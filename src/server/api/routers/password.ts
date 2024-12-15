import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const billRouter = createTRPCRouter({

    checkPassword: publicProcedure
    .input(z.object({ password: z.string().min(1) })) 
    .mutation(async ({ input }) => {
        const correctPassword = "9845";
      if (input.password === correctPassword) {
        return { success: true, message: "Password is correct, authenticated!" };
      } else {
        return { success: false, message: "Incorrect password, please try again." };
      }
    }),
});



