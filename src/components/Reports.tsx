
import { Contact } from "@/types/auth";
import { Phone, Check, Clock } from "lucide-react";

interface ReportsProps {
  contacts: Contact[];
}

const Reports = ({ contacts }: ReportsProps) => {
  const totalContacts = contacts.length;
  
  // Mock data for call reports since we don't have actual call data yet
  const totalCalls = 0;
  const successfulCalls = 0;
  const avgCallTime = "0:00";

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Call Reports</h2>
      </div>

      {/* Call Reports Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900">{totalCalls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Successful Calls</p>
              <p className="text-3xl font-bold text-gray-900">{successfulCalls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Call Time</p>
              <p className="text-3xl font-bold text-gray-900">{avgCallTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call History Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Call History</h3>
      </div>

      {/* Call History Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  CONTACT
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  DATE & TIME
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  DURATION
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  OUTCOME
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  NOTES
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No call history available.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
