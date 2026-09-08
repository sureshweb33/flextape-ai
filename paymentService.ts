import { v4 as uuidv4 } from "uuid";

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  amount: number;
  currency: string;
  status: "PAID_DEMO" | "FAILED" | "PENDING";
  timestamp: string;
  message: string;
}

export interface PaymentProvider {
  processPayment(amount: number, orderId: string, metadata?: Record<string, any>): Promise<PaymentResult>;
  getPaymentStatus(paymentId: string): Promise<string>;
}

// DEMO Payment Provider - clearly separated
export class DemoPaymentProvider implements PaymentProvider {
  async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const paymentId = `DEMO_PAY_${uuidv4().slice(0, 12).toUpperCase()}`;

    return {
      success: true,
      paymentId,
      amount,
      currency: "INR",
      status: "PAID_DEMO",
      timestamp: new Date().toISOString(),
      message: "Demo payment successful. No real money was charged.",
    };
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    return "PAID_DEMO";
  }
}

// Future: Real Razorpay provider
export class RazorpayPaymentProvider implements PaymentProvider {
  constructor(private keyId: string, private keySecret: string) {}

  async processPayment(amount: number, orderId: string): Promise<PaymentResult> {
    // TODO: Integrate Razorpay Orders + Checkout
    throw new Error("RazorpayPaymentProvider not implemented yet. Use DemoPaymentProvider for prototype.");
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    throw new Error("Not implemented");
  }
}

// Factory / Service
let currentProvider: PaymentProvider = new DemoPaymentProvider();

export function setPaymentProvider(provider: PaymentProvider) {
  currentProvider = provider;
}

export function getPaymentProvider(): PaymentProvider {
  return currentProvider;
}

export async function processDemoPayment(amount: number, orderId: string): Promise<PaymentResult> {
  return getPaymentProvider().processPayment(amount, orderId);
}
