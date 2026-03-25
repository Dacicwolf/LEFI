import { useEffect } from 'react';

export default function PageNotFound() {
    useEffect(() => {
        window.location.replace('/');
    }, []);

    return null;
}