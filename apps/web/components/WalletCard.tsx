import { formatCurrency } from "@/lib/currency";

interface WalletCardProps {
  balance: number;
  loading?: boolean;
}

export default function WalletCard({ balance, loading }: WalletCardProps) {
  return (
    <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-primary-200 text-sm font-medium">
          Wallet Balance
        </span>
        <svg
          className="w-6 h-6 text-primary-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      </div>
      {loading ? (
        <div className="h-10 bg-primary-500/50 rounded animate-pulse"></div>
      ) : (
        <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
      )}
    </div>
  );
}
