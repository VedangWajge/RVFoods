import { afterEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { Product } from "../src/models/Product.js";
import { createProduct, updateProduct } from "../src/controllers/productController.js";
import {
  createProductSchema,
  updateProductSchema,
  withConsistentCategories,
} from "../src/validators/productSchemas.js";

const run = (handler: unknown, req: unknown): Promise<any> =>
  new Promise((resolve, reject) => {
    const res = {
      status() {
        return this;
      },
      json: resolve,
    };
    (handler as (a: unknown, b: unknown, c: unknown) => void)(req, res, reject);
  });

const newProduct = {
  name: "Festive Box",
  price: 500,
  stock: 5,
};

afterEach(() => mock.restoreAll());

test("a product can be saved under several categories", async () => {
  const create = mock.method(Product, "create", (data: unknown) => Promise.resolve(data));

  await run(createProduct, {
    body: { ...newProduct, category: "sweets", categories: ["sweets", "combo"] },
  });

  const saved = create.mock.calls[0].arguments[0] as any;
  assert.equal(saved.category, "sweets");
  assert.deepEqual(saved.categories, ["sweets", "combo"]);
});

test("a product sent with one category is listed under just that one", async () => {
  const create = mock.method(Product, "create", (data: unknown) => Promise.resolve(data));

  await run(createProduct, { body: { ...newProduct, category: "ghee" } });

  assert.deepEqual((create.mock.calls[0].arguments[0] as any).categories, ["ghee"]);
});

test("editing categories saves both fields", async () => {
  const update = mock.method(Product, "findByIdAndUpdate", () =>
    Promise.resolve({ _id: "1" })
  );

  await run(updateProduct, {
    params: { id: "1" },
    body: { category: "spices", categories: ["spices", "snacks"] },
  });

  assert.deepEqual((update.mock.calls[0].arguments[1] as any).$set, {
    category: "spices",
    categories: ["spices", "snacks"],
  });
});

test("editing other fields leaves categories alone", async () => {
  const update = mock.method(Product, "findByIdAndUpdate", () =>
    Promise.resolve({ _id: "1" })
  );

  await run(updateProduct, { params: { id: "1" }, body: { stock: 3 } });

  assert.deepEqual((update.mock.calls[0].arguments[1] as any).$set, { stock: 3 });
});

test("the main category must be one of the listed categories", () => {
  assert.deepEqual(
    withConsistentCategories({ category: "ghee" as const, categories: ["sweets" as const] }),
    { category: "sweets", categories: ["sweets"] }
  );
});

test("the main category stays when it is still listed", () => {
  assert.equal(
    withConsistentCategories({
      category: "combo" as const,
      categories: ["sweets" as const, "combo" as const],
    }).category,
    "combo"
  );
});

test("repeated categories are removed", () => {
  assert.deepEqual(
    withConsistentCategories({ categories: ["ghee" as const, "ghee" as const] }).categories,
    ["ghee"]
  );
});

test("an empty or unknown category list is refused", () => {
  const base = { ...newProduct, category: "sweets" };
  assert.equal(createProductSchema.safeParse({ ...base, categories: [] }).success, false);
  assert.equal(createProductSchema.safeParse({ ...base, categories: ["toys"] }).success, false);
  assert.equal(updateProductSchema.safeParse({ categories: [] }).success, false);
});
