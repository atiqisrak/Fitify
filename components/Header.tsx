/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-3 md:py-4 px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-gray-200/60 absolute top-0 left-0 right-0 z-40">
      <div className="flex items-center justify-center gap-2">
        <img src="/Fitify.svg" alt="Fitify Logo" className="w-28 h-6 md:w-64 md:h-26" />
      </div>
    </header>
  );
};

export default Header;