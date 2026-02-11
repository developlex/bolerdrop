import test from "node:test";
import assert from "node:assert/strict";
import { mapCatalogProduct, mapCart, mapCustomer } from "@/src/lib/commerce/mappers";

test("mapCatalogProduct maps minimal Magento payload", () => {
  const mapped = mapCatalogProduct({
    uid: "uid-1",
    sku: "SKU-1",
    name: "Product One",
    url_key: "product-one",
    small_image: { url: "http://example.test/a.jpg" },
    price_range: {
      minimum_price: {
        final_price: { value: 10, currency: "USD" }
      }
    }
  });

  assert.equal(mapped.sku, "SKU-1");
  assert.equal(mapped.urlKey, "product-one");
  assert.equal(mapped.price, 10);
  assert.equal(mapped.currency, "USD");
});

test("mapCart maps totals and items", () => {
  const mapped = mapCart({
    id: "cart-1",
    total_quantity: 2,
    prices: { grand_total: { value: 99, currency: "USD" } },
    items: [
      {
        uid: "item-1",
        quantity: 2,
        product: { sku: "SKU-1", name: "Product One" },
        prices: {
          row_total_including_tax: { value: 99, currency: "USD" }
        }
      }
    ]
  });

  assert.equal(mapped.id, "cart-1");
  assert.equal(mapped.totalQuantity, 2);
  assert.equal(mapped.items.length, 1);
  assert.equal(mapped.items[0].lineTotal, 99);
});

test("mapCustomer maps customer profile", () => {
  const mapped = mapCustomer({ email: "a@b.c", firstname: "A", lastname: "B" });
  assert.equal(mapped.email, "a@b.c");
  assert.equal(mapped.firstname, "A");
  assert.equal(mapped.lastname, "B");
});
