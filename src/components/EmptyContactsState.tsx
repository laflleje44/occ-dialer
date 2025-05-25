
import { Users } from "lucide-react";

const EmptyContactsState = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts imported</h3>
      <p className="text-gray-500 mb-4">Upload a CSV file in the Upload Contacts tab to get started.</p>
    </div>
  );
};

export default EmptyContactsState;
