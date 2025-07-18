import z from "zod";

export const documentIdValidator = (zod = z) => {
    return zod
        .number()
        .int()
        .positive()
        .refine((val) => Number.isSafeInteger(val), {
            message: "DocumentId must be safe id format",
        });
};