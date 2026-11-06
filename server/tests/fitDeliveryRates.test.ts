import { test } from "node:test";
import assert from "node:assert/strict";
import { fitRates, parseSamples } from "../scripts/fitDeliveryRates.js";

test("recovers exact rates when BASE_KM is given", () => {
  // 50 up to 3 km, then 10 per km
  const fit = fitRates(
    [
      { km: 1, price: 50 },
      { km: 3, price: 50 },
      { km: 5, price: 70 },
      { km: 10, price: 120 },
    ],
    3
  );
  assert.equal(fit.BASE_KM, 3);
  assert.equal(fit.BASE_FARE, 50);
  assert.equal(fit.PER_KM_RATE, 10);
  assert.equal(fit.rmse, 0);
});

test("finds BASE_KM itself when it isn't given", () => {
  const fit = fitRates([
    { km: 1, price: 50 },
    { km: 3, price: 50 },
    { km: 5, price: 70 },
    { km: 10, price: 120 },
  ]);
  assert.equal(fit.BASE_FARE, 50);
  assert.equal(fit.PER_KM_RATE, 10);
  assert.equal(fit.rmse, 0);
});

test("never suggests a negative per-km rate", () => {
  const fit = fitRates(
    [
      { km: 2, price: 100 },
      { km: 8, price: 80 },
    ],
    0
  );
  assert.ok(fit.PER_KM_RATE >= 0);
  assert.ok(fit.BASE_FARE >= 0);
});

test("reports the error for each sample", () => {
  const fit = fitRates(
    [
      { km: 1, price: 50 },
      { km: 5, price: 90 },
      { km: 10, price: 130 },
    ],
    1
  );
  assert.equal(fit.rows.length, 3);
  for (const row of fit.rows) {
    assert.equal(row.error, row.fitted - row.price);
  }
});

test("parses km:price samples and rejects bad ones", () => {
  assert.deepEqual(parseSamples(["2:60", "5.5:95"]), [
    { km: 2, price: 60 },
    { km: 5.5, price: 95 },
  ]);
  assert.throws(() => parseSamples(["abc"]), /km:price/);
  assert.throws(() => parseSamples(["2:60"]), /at least 2/);
});
