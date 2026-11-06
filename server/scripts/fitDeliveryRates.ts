/**
 * Suggests BASE_FARE, BASE_KM and PER_KM_RATE from Porter quotes you collected.
 *
 *   npm run fit-rates -- 2:60 5:95 10:150 15:210
 *   npm run fit-rates -- --base-km=3 2:60 5:95 10:150 15:210
 *
 * Each sample is km:price, using the road distance Porter showed.
 * Use raw Porter prices: BUFFER_PERCENT is applied on top of the fitted rates.
 */
import { pathToFileURL } from "url";
import { DELIVERY_CONFIG } from "../src/config/delivery.js";
import { calculateDeliveryCharge } from "../src/utils/deliveryPricing.js";

export interface Sample {
  km: number;
  price: number;
}

export interface FitRow extends Sample {
  fitted: number;
  error: number;
}

export interface Fit {
  BASE_FARE: number;
  BASE_KM: number;
  PER_KM_RATE: number;
  rmse: number;
  rows: FitRow[];
}

const BASE_KM_STEP = 0.5;

const round = (value: number, step: number): number =>
  Math.round(value / step) * step;

const fitForBaseKm = (samples: Sample[], baseKm: number): Fit => {
  const xs = samples.map((s) => Math.max(0, s.km - baseKm));
  const ys = samples.map((s) => s.price);
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;

  let covariance = 0;
  let variance = 0;
  xs.forEach((x, i) => {
    covariance += (x - meanX) * (ys[i] - meanY);
    variance += (x - meanX) ** 2;
  });

  const rawRate = variance > 0 ? Math.max(0, covariance / variance) : 0;
  const rawBase = Math.max(0, meanY - rawRate * meanX);

  // Rates you could actually type into the config, with errors measured on those.
  const BASE_FARE = round(rawBase, 1);
  const PER_KM_RATE = round(rawRate, 0.5);

  const rows = samples.map((s) => {
    const fitted = BASE_FARE + Math.max(0, s.km - baseKm) * PER_KM_RATE;
    return { ...s, fitted, error: fitted - s.price };
  });
  const rmse = Math.sqrt(
    rows.reduce((sum, r) => sum + r.error ** 2, 0) / rows.length
  );

  return { BASE_FARE, BASE_KM: baseKm, PER_KM_RATE, rmse, rows };
};

export const fitRates = (samples: Sample[], baseKm?: number): Fit => {
  if (baseKm !== undefined) return fitForBaseKm(samples, baseKm);

  const maxKm = Math.max(...samples.map((s) => s.km));
  let best = fitForBaseKm(samples, 0);
  for (let km = BASE_KM_STEP; km < maxKm; km += BASE_KM_STEP) {
    const fit = fitForBaseKm(samples, km);
    if (fit.rmse < best.rmse - 1e-9) best = fit;
  }
  return best;
};

export const parseSamples = (args: string[]): Sample[] => {
  const samples = args.map((arg) => {
    const [km, price] = arg.split(":").map(Number);
    if (!Number.isFinite(km) || !Number.isFinite(price) || km < 0 || price < 0) {
      throw new Error(`Bad sample "${arg}". Use km:price, for example 5:95`);
    }
    return { km, price };
  });
  if (samples.length < 2) {
    throw new Error("Give at least 2 samples, for example: 2:60 5:95 10:150");
  }
  return samples.sort((a, b) => a.km - b.km);
};

const main = (): void => {
  const args = process.argv.slice(2);
  const baseKmArg = args.find((a) => a.startsWith("--base-km="));
  const baseKm = baseKmArg ? Number(baseKmArg.split("=")[1]) : undefined;
  const fit = fitRates(
    parseSamples(args.filter((a) => !a.startsWith("--"))),
    baseKm
  );

  console.log("\nSuggested values for server/src/config/delivery.ts:\n");
  console.log(`  BASE_FARE:   ${fit.BASE_FARE}`);
  console.log(`  BASE_KM:     ${fit.BASE_KM}`);
  console.log(`  PER_KM_RATE: ${fit.PER_KM_RATE}`);
  console.log(`  MIN_CHARGE:  ${fit.BASE_FARE}\n`);

  const rates = {
    ...DELIVERY_CONFIG,
    BASE_FARE: fit.BASE_FARE,
    BASE_KM: fit.BASE_KM,
    PER_KM_RATE: fit.PER_KM_RATE,
    MIN_CHARGE: fit.BASE_FARE,
  };

  console.log("     km   Porter   Fitted    Error   Customer pays");
  for (const row of fit.rows) {
    console.log(
      `${row.km.toFixed(1).padStart(7)}` +
        `${row.price.toFixed(0).padStart(9)}` +
        `${row.fitted.toFixed(1).padStart(9)}` +
        `${((row.error >= 0 ? "+" : "") + row.error.toFixed(1)).padStart(9)}` +
        `${calculateDeliveryCharge(row.km, rates).toFixed(0).padStart(16)}`
    );
  }

  console.log(`\nAverage error (RMSE): Rs ${fit.rmse.toFixed(1)}`);
  console.log(
    `"Customer pays" includes the ${DELIVERY_CONFIG.BUFFER_PERCENT}% buffer and rounding up to Rs ${DELIVERY_CONFIG.ROUND_TO}.`
  );
  if (fit.rows.length < 4) {
    console.log("Tip: 5 or more quotes across your delivery range give a steadier fit.");
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
}
