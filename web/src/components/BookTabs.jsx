import { useState, useEffect } from 'react';
import { Tabs } from "flowbite-react";

const BookTabs = ({ tabs, activeTab, onTabChange, children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkSize = () => setIsMobile(window.innerWidth < 768);
        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    return (
        <Tabs onActiveTabChange={onTabChange} variant={isMobile ? "fullWidth" : "underline"} className="pt-1">
            {tabs.map((tab) => (
                <Tabs.Item key={tab.id} active={activeTab === tab.id} title={isMobile ? "" : tab.title} icon={tab.icon}>
                    <div className="pt-4">
                        {children}
                    </div>
                </Tabs.Item>
            ))}
        </Tabs>
    );
};

export default BookTabs;