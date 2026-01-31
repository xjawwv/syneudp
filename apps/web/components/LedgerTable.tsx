import { formatCurrency } from "@/lib/currency";

interface LedgerEntry {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

interface LedgerTableProps {
  entries: LedgerEntry[];
  loading?: boolean;
}

export default function LedgerTable({ entries, loading }: LedgerTableProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="p-8 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800">Recent Transactions</h3>
      </div>
      {entries.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No transactions yet</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        entry.type === "deposit"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {entry.description}
                  </td>
                  <td
                    className={`px-4 py-4 text-sm font-medium text-right ${
                      entry.amount >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {entry.amount >= 0 ? "+" : ""}
                    {formatCurrency(entry.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 text-right">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
