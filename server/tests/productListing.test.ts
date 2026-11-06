import { afterEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { Product } from "../src/models/Product.js";
import { getProducts } from "../src/controllers/productController.js";
import { buildProductListPipeline } from "../src/utils/productListing.js";

const sortStage = (sort?: string) => {
  const stage = buildProductListPipeline({}, sort, 0, 9).find(
    (s) => "$sort" in s
  ) as { $sort: Record<string, number> };
  return stage.$sort;
};

afterEach(() => mock.restoreAll());

test("in-stock comes first for every sort, then the chosen sort", () => {
  assert.deepEqual(Object.entries(sortStage("price-asc")), [
    ["inStock", -1],
    ["price", 1],
    ["_id", -1],
  ]);
  assert.deepEqual(Object.keys(sortStage("price-desc")), ["inStock", "price", "_id"]);
  assert.deepEqual(Object.keys(sortStage("rating-desc")), [
    "inStock",
    "ratings.average",
    "_id",
  ]);
  assert.deepEqual(Object.keys(sortStage("newest")), ["inStock", "createdAt", "_id"]);
});

test("no sort falls back to newest, still in-stock first", () => {
  assert.deepEqual(Object.keys(sortStage()), ["inStock", "createdAt", "_id"]);
});

test("zero stock counts as out of stock", () => {
  const stage = buildProductListPipeline({}, undefined, 0, 9).find(
    (s) => "$addFields" in s
  ) as { $addFields: { inStock: unknown } };
  assert.deepEqual(stage.$addFields.inStock, { $cond: [{ $gt: ["$stock", 0] }, 1, 0] });
});

test("filtering runs first, so category filters and search still apply", () => {
  const pipeline = buildProductListPipeline({ category: "sweets" }, "newest", 9, 9);
  assert.deepEqual(pipeline[0], { $match: { category: "sweets" } });
});

test("sorting happens before the page is cut, and the helper field is removed", () => {
  const pipeline = buildProductListPipeline({}, "newest", 18, 9);
  const stageNames = pipeline.map((stage) => Object.keys(stage)[0]);
  assert.deepEqual(stageNames, [
    "$match",
    "$addFields",
    "$sort",
    "$skip",
    "$limit",
    "$project",
  ]);
  assert.deepEqual(pipeline[3], { $skip: 18 });
  assert.deepEqual(pipeline[4], { $limit: 9 });
  assert.deepEqual(pipeline[5], { $project: { inStock: 0 } });
});

test("the products route filters by category and reports pages", async () => {
  const aggregate = mock.method(Product, "aggregate", () =>
    Promise.resolve([{ name: "Anarse", stock: 10 }])
  );
  const count = mock.method(Product, "countDocuments", () => Promise.resolve(10));

  const body: any = await new Promise((resolve, reject) => {
    const res = {
      status() {
        return this;
      },
      json: resolve,
    };
    getProducts(
      { query: { category: "sweets", page: "2", limit: "9" } } as never,
      res as never,
      reject as never
    );
  });

  const pipeline = aggregate.mock.calls[0].arguments[0] as unknown as Record<string, any>[];
  const expectedFilter = {
    isActive: true,
    $or: [{ category: "sweets" }, { categories: "sweets" }],
  };
  assert.deepEqual(pipeline[0].$match, expectedFilter);
  assert.equal(pipeline[3].$skip, 9);
  assert.deepEqual(count.mock.calls[0].arguments[0], expectedFilter);
  assert.deepEqual(body.data.pagination, { page: 2, limit: 9, total: 10, pages: 2 });
  assert.deepEqual(body.data.products, [{ name: "Anarse", stock: 10 }]);
});
