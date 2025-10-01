

import fetch from 'node-fetch'; 



export const getRandomWallpaper = async (req, res) => {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; 
    
    
    if (!UNSPLASH_ACCESS_KEY) {
        return res.status(500).json({ error: "Server configuration error: Missing Unsplash Key" });
    }


    const url = `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}&query=wallpaper&orientation=landscape&w=1920&h=1080`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.urls && data.urls.regular) {
            const imageUrl = data.urls.regular; 
            return res.json({ image: imageUrl });
        } else {
            return res.status(404).json({ error: "No image found from Unsplash" });
        }
    } catch (error) {
        console.error("Unsplash API Error:", error.message); 
        return res.status(500).json({ error: "Failed to fetch image from external API" });
    }
};