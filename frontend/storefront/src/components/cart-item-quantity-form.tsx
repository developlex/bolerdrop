"use client";

import { useRef } from "react";
import { updateCartItemAction } from "@/app/actions/cart";
import { ui } from "@/src/ui/styles";

type CartItemQuantityFormProps = {
  cartItemUid: string;
  quantity: number;
};

export function CartItemQuantityForm({ cartItemUid, quantity }: CartItemQuantityFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form action={updateCartItemAction} ref={formRef}>
      <input type="hidden" name="cart_item_uid" value={cartItemUid} />
      <label className="block text-sm">
        <span className={ui.text.label + " mb-1 block"}>Qty</span>
        <input
          name="quantity"
          type="number"
          min={1}
          step={1}
          defaultValue={quantity}
          className={ui.form.inputCompact}
          onChange={(event) => {
            const parsed = Number(event.currentTarget.value);
            if (Number.isFinite(parsed) && parsed > 0) {
              formRef.current?.requestSubmit();
            }
          }}
        />
      </label>
    </form>
  );
}
