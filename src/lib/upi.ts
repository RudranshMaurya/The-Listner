export const DESTINATION_UPI_ID = import.meta.env.VITE_UPI_DESTINATION_VPA || "rudransh-maurya@fam";
export const PAYEE_NAME = import.meta.env.VITE_UPI_PAYEE_NAME || "The Listener";

/**
 * Generates a unique Topup Order Reference ID e.g. "TL-8F92A1"
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TL-${timestamp}${random}`;
}

/**
 * Builds a strictly compliant UPI URI
 * upi://pay?pa=rudransh-maurya@fam&pn=The%20Listener&am=100.00&cu=INR&tr=ORDER_ID&tn=WALLET_TOPUP
 */
export function generateUpiUri(options: {
  vpa?: string;
  payeeName?: string;
  amountRupees: number;
  orderId: string;
  note?: string;
}): string {
  const vpa = options.vpa || DESTINATION_UPI_ID;
  const payeeName = options.payeeName || PAYEE_NAME;
  const amountStr = options.amountRupees.toFixed(2);
  const note = options.note || `Wallet Topup - ${options.orderId}`;

  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName,
    am: amountStr,
    cu: "INR",
    tr: options.orderId,
    tn: note
  });

  return `upi://pay?${params.toString()}`;
}

/**
 * Format paise to formatted Rupees string
 * e.g. 50000 -> "₹500.00"
 */
export function formatPaise(paise: number = 0): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}

/**
 * Format raw rupees to formatted Rupees string
 */
export function formatRupees(rupees: number = 0): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}
