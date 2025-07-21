import NiceModal, { NiceModalArgs } from "@/store/nice-modal-context";
import React from "react";

export const showComponentNiceDialog = <
    T,
    C = any,
    P extends Partial<NiceModalArgs<React.FC<C>>> = Partial<
        NiceModalArgs<React.FC<C>>
    >
>(
    modal: React.FC<C>,
    args?: P
): Promise<{
    result: T;
    reason?: string;
}> => {
    return NiceModal.show<T, C, P>(modal, args) as Promise<{
        result: T;
        reason?: string;
    }>;
};