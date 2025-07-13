// Script pour créer un favicon WeatherGlass simple
// Utilisable dans la console du navigateur

function createWeatherGlassFavicon() {
    // Créer un canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Arrière-plan avec dégradé WeatherGlass
    const gradient = ctx.createRadialGradient(10, 10, 0, 16, 16, 16);
    gradient.addColorStop(0, '#60A5FA');
    gradient.addColorStop(1, '#1E293B');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    
    // Bordure arrondie
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(16, 16, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // Soleil
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(13, 11, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Nuage simple
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(16, 20, 8, 0, Math.PI, true);
    ctx.arc(12, 18, 4, 0, Math.PI, false);
    ctx.arc(20, 18, 4, 0, Math.PI, false);
    ctx.fill();
    
    // Retourner le data URL
    return canvas.toDataURL('image/png');
}

// Utilisation :
// const faviconData = createWeatherGlassFavicon();
// console.log('Favicon data URL:', faviconData);

// Pour tester, décommentez cette ligne :
// createWeatherGlassFavicon();