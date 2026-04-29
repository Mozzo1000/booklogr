import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Drawer, DrawerHeader, DrawerItems } from 'flowbite-react';
import { RiCloseLine } from 'react-icons/ri';

const AdaptiveDialog = ({ 
		show, 
		onClose, 
		title, 
		children, 
		footer, 
		size = '2xl',
		type = 'modal' 
	}) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkSize();
        window.addEventListener('resize', checkSize);
        return () => window.removeEventListener('resize', checkSize);
    }, []);

    if (isMobile && type === 'drawer') {
        return (
            <Drawer open={show} onClose={onClose} position="bottom" className={`${show ? "mb-16" : "mb-0"} rounded-t-xl h-[50vh] flex flex-col overflow-hidden transition-all duration-300`}>
                <DrawerHeader title={title} />
                <DrawerItems className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4">
                        {children}
                    </div>

                    {footer && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-2 shrink-0">
                            {footer}
                        </div>
                    )}
                </DrawerItems>
            </Drawer>
        );
    }

    if (isMobile && type === 'modal') {
        if (!show) return null;

        return (
            <div className="fixed inset-0 z-70 bg-white dark:bg-gray-900 flex flex-col animate-in fade-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
                    <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <RiCloseLine size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {children}
                </div>

                {footer && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-800 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Modal show={show} onClose={onClose} size={size} dismissible>
            <ModalHeader className="border-gray-200 dark:border-gray-700">
                {title}
            </ModalHeader>
            <ModalBody className="overflow-y-auto max-h-[75vh]">
                {children}
            </ModalBody>
            {footer && (
                <ModalFooter className="border-gray-200 dark:border-gray-700">
                    <div className="w-full flex justify-end gap-2">
                        {footer}
                    </div>
                </ModalFooter>
            )}
        </Modal>
    );
};

export default AdaptiveDialog;