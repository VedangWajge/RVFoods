import type { PipelineStage } from "mongoose";

type SortFields = Record<string, 1 | -1>;

const SORT_OPTIONS: Record<string, SortFields> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "rating-desc": { "ratings.average": -1 },
  newest: { createdAt: -1 },
};

/**
 * In-stock products always come first, then the customer's chosen sort.
 * This has to run in the database: sorting one page at a time in the browser could
 * leave out-of-stock items on page 1 and in-stock ones on page 2.
 */
export const buildProductListPipeline = (
  filter: Record<string, unknown>,
  sort: string | undefined,
  skip: number,
  limit: number
): PipelineStage[] => [
  { $match: filter },
  { $addFields: { inStock: { $cond: [{ $gt: ["$stock", 0] }, 1, 0] } } },
  {
    $sort: {
      inStock: -1,
      ...(SORT_OPTIONS[sort ?? "newest"] ?? SORT_OPTIONS.newest),
      // Keeps the order fixed between pages when the other values tie.
      _id: -1,
    },
  },
  { $skip: skip },
  { $limit: limit },
  { $project: { inStock: 0 } },
];
