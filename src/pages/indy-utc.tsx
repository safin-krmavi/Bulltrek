import React from 'react';

const IndyUTC: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Indy UTC Trading</h1>
      <div className="bg-white dark:bg-[#232326] rounded-lg shadow p-6">
        <div className="space-y-4">
          {/* Add your Indy UTC trading interface components here */}
          <p className="text-gray-600 dark:text-gray-300">
            Configure your Indy UTC trading settings and parameters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IndyUTC;