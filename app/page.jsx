'use client';
import Image from "next/image";

import { useState } from 'react'; 


export default function Home() {
  // State for form data
  const [formData, setFormData] = useState({
    officeStartTime: '',
    officeEndTime: '',
    scheduleStartDate: '',
    scheduleEndDate: '',
    totalHoursPerWeek: '',
    minShiftLength: 2,
    maxShiftLength: 8
  });

  // This function will run when inputs change

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,  // Keep all existing data
      [field]: value  // Update only the changed field
    });
  };

  // console.log('Current form data:', formData);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Office Schedule Builder
          </h1>
          <p className="text-gray-600 mt-2">
            Create your semester schedule in minutes
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form>
            
            {/* Section 1: Office Hours */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                1. Office Hours
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.officeStartTime}
                    onChange={(e) => handleInputChange('officeStartTime', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.officeEndTime}
                    onChange={(e) => handleInputChange('officeEndTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Schedule Period */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                2. Schedule Period
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.scheduleStartDate}
                    onChange={(e) => handleInputChange('scheduleStartDate', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.scheduleEndDate}
                    onChange={(e) => handleInputChange('scheduleEndDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Hours & Constraints */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                3. Hours & Shift Constraints
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Hours/Week
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.totalHoursPerWeek}
                    onChange={(e) => handleInputChange('totalHoursPerWeek', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Shift (hours)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.minShiftLength}
                    onChange={(e) => handleInputChange('minShiftLength', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Shift (hours)
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.maxShiftLength}
                    onChange={(e) => handleInputChange('maxShiftLength', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Placeholder for Workers Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                4. Workers (Coming Next!)
              </h2>
              <p className="text-gray-500 italic">
                We'll add worker input in the next step
              </p>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
