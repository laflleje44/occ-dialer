
import { Contact } from "@/types/auth";
import { Badge } from "@/components/ui/badge";

interface ReportsProps {
  contacts: Contact[];
}

const Reports = ({ contacts }: ReportsProps) => {
  const totalContacts = contacts.length;
  const attendingYes = contacts.filter(c => c.attending === "yes").length;
  const attendingNo = contacts.filter(c => c.attending === "no").length;
  const withComments = contacts.filter(c => c.comments && c.comments.trim() !== "").length;

  const attendingPercentage = totalContacts > 0 ? (attendingYes / totalContacts * 100).toFixed(1) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Reports</h2>
        <p className="text-gray-600">
          Overview of your contact database and calling statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Contacts</h3>
          <p className="text-3xl font-bold text-gray-900">{totalContacts}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Attending</h3>
          <p className="text-3xl font-bold text-green-600">{attendingYes}</p>
          <p className="text-sm text-gray-500">{attendingPercentage}% of total</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Not Attending</h3>
          <p className="text-3xl font-bold text-red-600">{attendingNo}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 mb-2">With Comments</h3>
          <p className="text-3xl font-bold text-blue-600">{withComments}</p>
        </div>
      </div>

      {totalContacts === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No data available. Import contacts to view reports.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contact Summary</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${attendingPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{attendingPercentage}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">By Attendance Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attending</span>
                      <Badge variant="default">{attendingYes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Not Attending</span>
                      <Badge variant="secondary">{attendingNo}</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Data Quality</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Complete Profiles</span>
                      <Badge variant="outline">{withComments}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Missing Comments</span>
                      <Badge variant="outline">{totalContacts - withComments}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
