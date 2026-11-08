import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { Megaphone, Percent, RotateCcw } from "lucide-react";
import { offerService } from "@/services/offerService";
import { getErrorMessage } from "@/services/api";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loader from "@/components/common/Loader";
import { cn } from "@/lib/utils";
import type { AdminFestiveOffer, UpdateFestiveOfferPayload } from "@/types/offer.types";

interface ToggleRowProps {
  id: string;
  icon: typeof Megaphone;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ id, icon: Icon, title, description, checked, disabled, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-white p-5">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p id={`${id}-label`} className="font-semibold text-text-primary">
            {title}
          </p>
          <p className="mt-0.5 text-sm text-text-secondary">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50",
          checked ? "bg-success" : "bg-border"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

export default function ManageOffer() {
  const showToast = useUIStore((s) => s.showToast);
  const [offer, setOffer] = useState<AdminFestiveOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxOrders, setMaxOrders] = useState("");

  const showOffer = useCallback((next: AdminFestiveOffer | null) => {
    if (!next) return;
    setOffer(next);
    setTitle(next.title);
    setDiscountPercent(String(next.discountPercent));
    setMaxOrders(String(next.maxOrders));
  }, []);

  useEffect(() => {
    offerService
      .getAdminOffer()
      .then(showOffer)
      .catch((err) => showToast(getErrorMessage(err), "error"))
      .finally(() => setLoading(false));
  }, [showOffer, showToast]);

  const save = async (payload: UpdateFestiveOfferPayload, doneMessage: string) => {
    setSaving(true);
    try {
      showOffer(await offerService.updateAdminOffer(payload));
      showToast(doneMessage, "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = (e: FormEvent) => {
    e.preventDefault();
    const percent = Number(discountPercent);
    const orders = Number(maxOrders);
    if (!Number.isInteger(percent) || percent < 1 || percent > 90) {
      showToast("Discount must be a whole number from 1 to 90.", "error");
      return;
    }
    if (!Number.isInteger(orders) || orders < 1 || orders > 1000) {
      showToast("Number of orders must be a whole number from 1 to 1000.", "error");
      return;
    }
    void save(
      { title: title.trim(), discountPercent: percent, maxOrders: orders },
      "Offer details saved"
    );
  };

  const handleResetCount = () => {
    if (
      window.confirm(
        `Start counting again from zero? The next ${offer?.maxOrders ?? ""} confirmed orders will get the discount.`
      )
    ) {
      void save({ resetCount: true }, "Offer count reset");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader size="lg" label="Loading offer..." />
      </div>
    );
  }

  if (!offer) {
    return <p className="text-sm text-text-secondary">Could not load the offer. Please refresh the page.</p>;
  }

  const usedPercent = Math.min(100, Math.round((offer.claimed / offer.maxOrders) * 100));

  return (
    <>
      <Helmet>
        <title>Festive Offer | Admin | RV Foods</title>
      </Helmet>

      <div className="max-w-3xl space-y-6">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-text-primary">
            Festive Offer
          </h2>
          <p className="text-sm text-text-secondary">
            Give {offer.discountPercent}% off the first {offer.maxOrders} orders, and show a banner on the home page.
          </p>
        </div>

        <div className="space-y-3">
          <ToggleRow
            id="offer-banner"
            icon={Megaphone}
            title="Show banner on home page"
            description="Customers see the offer and how many discounted orders are left."
            checked={offer.bannerEnabled}
            disabled={saving}
            onChange={(checked) =>
              void save({ bannerEnabled: checked }, checked ? "Banner is now showing" : "Banner hidden")
            }
          />
          <ToggleRow
            id="offer-discount"
            icon={Percent}
            title={`Give ${offer.discountPercent}% discount`}
            description="Taken off the order total automatically. It doesn't add to promo codes: the bigger discount applies."
            checked={offer.discountEnabled}
            disabled={saving}
            onChange={(checked) =>
              void save({ discountEnabled: checked }, checked ? "Discount switched on" : "Discount switched off")
            }
          />
        </div>

        <div className="rounded-xl border border-border bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold text-text-primary">Discounted orders used</p>
            <p className="text-sm text-text-secondary">
              <span className="text-lg font-bold text-text-primary">{offer.claimed}</span> of {offer.maxOrders}
              {" · "}
              {offer.remaining} left
            </p>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-border" aria-hidden>
            <div
              className={cn("h-full rounded-full", offer.remaining === 0 ? "bg-error" : "bg-success")}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-text-secondary">
            Only orders the customer confirmed count. Cancelling an order gives its place back.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetCount}
            disabled={saving}
            className="mt-4 border-border bg-white"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" aria-hidden />
            Reset count to zero
          </Button>
        </div>

        <form onSubmit={handleSaveDetails} className="space-y-4 rounded-xl border border-border bg-white p-5">
          <p className="font-semibold text-text-primary">Offer details</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-3">
              <Label htmlFor="offer-title">Offer name</Label>
              <Input
                id="offer-title"
                value={title}
                maxLength={60}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Diwali Offer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer-percent">Discount (%)</Label>
              <Input
                id="offer-percent"
                type="number"
                min={1}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="offer-orders">Number of orders</Label>
              <Input
                id="offer-orders"
                type="number"
                min={1}
                max={1000}
                value={maxOrders}
                onChange={(e) => setMaxOrders(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            Save details
          </Button>
        </form>
      </div>
    </>
  );
}
