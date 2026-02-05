import { useState } from 'react';

export const usePasswordHasher = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const hashPassword = async (password) => {
        setIsLoading(true);
        setError(null);

        try {
            // transforme le mot de passe en bits
            const encoder = new TextEncoder();
            const data = encoder.encode(password);

            // hash le SHA-1
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);

            // converte le hash en une chaîne hexadécimale
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

            // separe entre prefix et suffixe
            const prefix = hashHex.slice(0, 5);
            const suffix = hashHex.slice(5);

            return { prefix, suffix };
        } catch (err) {
            setError("Failed to hash password");
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return { hashPassword, isLoading, error };
};