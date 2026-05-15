import { Horizon, Networks, Asset } from "@stellar/stellar-sdk";

const NETWORK = process.env.STELLAR_NETWORK ?? "testnet";
const HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const server = new Horizon.Server(HORIZON_URL);
export const networkPassphrase =
  NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;

// USDC asset
export const USDC_ASSET = new Asset(
  "USDC",
  NETWORK === "mainnet"
    ? "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    : "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
);

/**
 * Verifies a Stellar payment transaction on-chain.
 * Returns true if the payment matches the expected recipient, amount, and currency.
 */
export async function verifyPaymentOnChain(params: {
  txHash: string;
  expectedRecipient: string;
  expectedAmount: number;
  currency: "XLM" | "USDC";
}): Promise<{ valid: boolean; error?: string }> {
  try {
    const tx = await server.transactions().transaction(params.txHash).call();

    if (!tx.successful) {
      return { valid: false, error: "Transaction was not successful on Stellar" };
    }

    const ops = await server.operations().forTransaction(params.txHash).call();
    const paymentOp = ops.records.find(
      (op: { type: string }) => op.type === "payment"
    ) as {
      type: string;
      to: string;
      amount: string;
      asset_type: string;
      asset_code?: string;
    } | undefined;

    if (!paymentOp) {
      return { valid: false, error: "No payment operation in transaction" };
    }

    if (paymentOp.to !== params.expectedRecipient) {
      return { valid: false, error: "Payment recipient mismatch" };
    }

    const paidAmount = parseFloat(paymentOp.amount);
    if (Math.abs(paidAmount - params.expectedAmount) > 0.0001) {
      return { valid: false, error: "Payment amount mismatch" };
    }

    if (params.currency === "XLM" && paymentOp.asset_type !== "native") {
      return { valid: false, error: "Expected XLM but got different asset" };
    }

    if (params.currency === "USDC" && paymentOp.asset_code !== "USDC") {
      return { valid: false, error: "Expected USDC but got different asset" };
    }

    return { valid: true };
  } catch (err) {
    console.error("Stellar verification error:", err);
    return { valid: false, error: "Failed to verify transaction on Stellar network" };
  }
}
