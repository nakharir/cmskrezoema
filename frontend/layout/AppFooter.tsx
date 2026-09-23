/* eslint-disable @next/next/no-img-element */

import React from 'react';

const AppFooter = () => {
    return (
        <div className="layout-footer flex align-items-center justify-content-between flex-wrap gap-2 py-3 px-4">
            <div className="flex align-items-center gap-2">
                <span className="font-bold text-sm" style={{ color: '#D96C91' }}>
                    KREZOEMA
                </span>
                <span className="text-500 text-xs hidden sm:inline">
                    — Creative Craft &amp; Handmade Accessories
                </span>
            </div>
            <div className="text-xs text-500">
                &copy; {new Date().getFullYear()} KREZOEMA Admin Dashboard
            </div>
        </div>
    );
};

export default AppFooter;
