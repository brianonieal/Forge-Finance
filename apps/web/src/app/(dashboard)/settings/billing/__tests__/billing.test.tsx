import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";

const getSubscriptionMock = vi.fn();
const getInvoicesMock = vi.fn();
const createCheckoutMock = vi.fn();
const createPortalMock = vi.fn();
const toastMock = vi.fn();

vi.mock("@/lib/api", () => ({
  api: {
    billing: {
      getSubscription: () => getSubscriptionMock(),
      getInvoices: () => getInvoicesMock(),
      createCheckoutSession: (s: string, c: string) => createCheckoutMock(s, c),
      createPortalSession: (r: string) => createPortalMock(r),
    },
  },
}));

vi.mock("@/components/ui/toast", () => ({
  toast: (args: unknown) => toastMock(args),
}));

import BillingPage from "../page";

const FREE_RESPONSE = { plan: "free" as const, subscription: null };
const PRO_RESPONSE = {
  plan: "pro" as const,
  subscription: {
    id: "sub_x",
    status: "active",
    current_period_end: 1735689600,
    cancel_at_period_end: false,
  },
};
const INVOICES = {
  invoices: [
    {
      id: "in_1",
      amount_paid: 900,
      currency: "usd",
      status: "paid",
      created: 1730000000,
      hosted_invoice_url: "https://invoice.stripe.com/x",
      invoice_pdf: "https://invoice.stripe.com/x.pdf",
      period_start: 1730000000,
      period_end: 1732678400,
    },
  ],
};

describe("Billing page", () => {
  beforeEach(() => {
    getSubscriptionMock.mockReset();
    getInvoicesMock.mockReset();
    createCheckoutMock.mockReset();
    createPortalMock.mockReset();
    toastMock.mockReset();
  });
  afterEach(cleanup);

  it("shows loading state initially", () => {
    getSubscriptionMock.mockReturnValue(new Promise(() => {}));
    getInvoicesMock.mockReturnValue(new Promise(() => {}));
    render(<BillingPage />);
    expect(screen.getByText(/Loading billing details/i)).toBeInTheDocument();
  });

  it("renders Forge Free plan card for free users", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Forge Free")).toBeInTheDocument();
    });
  });

  it("renders Forge Pro plan card for pro users", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Forge Pro")).toBeInTheDocument();
    });
  });

  it("shows Upgrade button for free users", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Upgrade to Pro/)).toBeInTheDocument();
    });
  });

  it("shows Manage billing button for pro users", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Manage billing/)).toBeInTheDocument();
    });
  });

  it("renders plan comparison table with all features", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Compare plans")).toBeInTheDocument();
    });
    expect(screen.getByText("@ORACLE AI queries")).toBeInTheDocument();
    expect(screen.getByText("Priority support")).toBeInTheDocument();
    expect(screen.getByText("$9/mo")).toBeInTheDocument();
  });

  it("does not render payment history for free users", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Forge Free")).toBeInTheDocument();
    });
    expect(screen.queryByText("Payment history")).not.toBeInTheDocument();
  });

  it("renders payment history for pro users", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Payment history")).toBeInTheDocument();
    });
  });

  it("renders invoice rows", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("$9.00")).toBeInTheDocument();
      expect(screen.getByText("paid")).toBeInTheDocument();
    });
  });

  it("triggers checkout when Upgrade is clicked", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    createCheckoutMock.mockResolvedValue({
      id: "cs_x",
      url: "https://checkout.stripe.com/cs_x",
    });
    Object.defineProperty(window, "location", {
      value: { origin: "http://test", href: "" },
      writable: true,
    });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Upgrade to Pro/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Upgrade to Pro/));
    await waitFor(() => {
      expect(createCheckoutMock).toHaveBeenCalledWith(
        "http://test/settings/billing?status=success",
        "http://test/settings/billing?status=cancelled"
      );
    });
  });

  it("opens cancellation modal when Cancel subscription is clicked", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Cancel subscription")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel subscription"));
    expect(screen.getByText("Cancel your subscription?")).toBeInTheDocument();
    expect(screen.getByText("Keep Pro")).toBeInTheDocument();
  });

  it("closes cancellation modal when Keep Pro is clicked", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Cancel subscription")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel subscription"));
    fireEvent.click(screen.getByText("Keep Pro"));
    expect(screen.queryByText("Cancel your subscription?")).not.toBeInTheDocument();
  });

  it("shows toast when checkout fails", async () => {
    getSubscriptionMock.mockResolvedValue(FREE_RESPONSE);
    getInvoicesMock.mockResolvedValue({ invoices: [] });
    createCheckoutMock.mockRejectedValue(new Error("network"));
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Upgrade to Pro/)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(/Upgrade to Pro/));
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: "error" })
      );
    });
  });

  it("renders cancellation modal with confirm button", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Cancel subscription")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel subscription"));
    expect(screen.getByText("Continue to Stripe")).toBeInTheDocument();
  });

  it("triggers portal session when confirming cancellation", async () => {
    getSubscriptionMock.mockResolvedValue(PRO_RESPONSE);
    getInvoicesMock.mockResolvedValue(INVOICES);
    createPortalMock.mockResolvedValue({
      url: "https://billing.stripe.com/p/x",
    });
    Object.defineProperty(window, "location", {
      value: { origin: "http://test", href: "" },
      writable: true,
    });
    render(<BillingPage />);
    await waitFor(() => {
      expect(screen.getByText("Cancel subscription")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Cancel subscription"));
    fireEvent.click(screen.getByText("Continue to Stripe"));
    await waitFor(() => {
      expect(createPortalMock).toHaveBeenCalledWith("http://test/settings/billing");
    });
  });
});
