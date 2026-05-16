import { useState, useEffect } from 'react';
import AuthService from './services/auth.service';

export const useProfilePicture = (filename) => {
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!filename) {
            setImgSrc(null); 
            setLoading(false);
            return;
        }

        let isMounted = true;
        let objectURL = null;

        const fetchImage = async () => {
            try {
                const response = await AuthService.getProfilePicture(filename);
                
                if (isMounted) {
                    objectURL = URL.createObjectURL(response.data);
                    setImgSrc(objectURL);
                }
            } catch (error) {
                console.error("Failed to load profile picture:", error);
                setImgSrc(""); 
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchImage();

        return () => {
            isMounted = false;
            if (objectURL) {
                URL.revokeObjectURL(objectURL);
            }
        };
    }, [filename]);

    return { imgSrc, loading };
};