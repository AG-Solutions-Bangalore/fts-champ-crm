import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';

import BASE_URL from '@/config/base-url';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AddToGroup = ({ id, closegroupModal }) => {
  const token = Cookies.get('token');

  const { data: donorData = [], isLoading } = useQuery({
    queryKey: ['donors'],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/api/fetch-donors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data.individualCompanies.map(donor => ({
        name: donor.indicomp_full_name,
        phone: donor.indicomp_mobile_phone,
        id: donor.indicomp_related_id,
      }));
    },
  });

  const addMemberToGroup = async (relativeId) => {
    try {
      await axios({
        url: `${BASE_URL}/api/update-donor/${id}`,
        method: 'PUT',
        data: { indicomp_related_id: relativeId },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      toast.success('Successfully added to group');
      closegroupModal();
    } catch (error) {
      console.error('Error adding member to group:', error);
      toast.error('Failed to add member to group');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-56">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <ArrowLeft 
          onClick={closegroupModal}
          className="w-5 h-5 cursor-pointer text-gray-600 hover:text-red-600 transition-colors"
        />
        <h2 className="text-lg font-semibold text-gray-900">Add to Group</h2>
      </div>

      {/* Table */}
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donorData.map((donor, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{donor.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{donor.phone}</td>
                <td className="px-4 py-3 text-sm">
                  <button
                    onClick={() => addMemberToGroup(donor.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddToGroup;