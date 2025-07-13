// Script pour générer les icônes PWA à partir du SVG
// Utilisable dans la console du navigateur

function createWeatherGlassIcon(size) {
    // Créer un canvas
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Facteur d'échelle pour adapter à la taille
    const scale = size / 48;
    
    // Arrière-plan avec dégradé WeatherGlass
    const bgGradient = ctx.createRadialGradient(
        size * 0.3, size * 0.3, 0,
        size * 0.5, size * 0.5, size * 0.6
    );
    bgGradient.addColorStop(0, '#60A5FA');
    bgGradient.addColorStop(1, '#1E293B');
    
    // Cercle de fond
    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size * 0.46, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bordure avec dégradé
    const borderGradient = ctx.createLinearGradient(0, 0, size, size);
    borderGradient.addColorStop(0, 'rgba(255,255,255,0.6)');
    borderGradient.addColorStop(1, 'rgba(255,255,255,0.2)');
    
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size * 0.46, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Soleil
    ctx.fillStyle = '#FCD34D';
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(size * 0.42, size * 0.375, 6 * scale, 0, 2 * Math.PI);
    ctx.fill();
    
    // Rayons du soleil
    ctx.strokeStyle = '#FCD34D';
    ctx.lineWidth = 1.5 * scale;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8;
    
    const sunCenterX = size * 0.42;
    const sunCenterY = size * 0.375;
    const rayLength = 4 * scale;
    const rayDistance = 10 * scale;
    
    // 8 rayons autour du soleil
    for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const startX = sunCenterX + Math.cos(angle) * rayDistance;
        const startY = sunCenterY + Math.sin(angle) * rayDistance;
        const endX = sunCenterX + Math.cos(angle) * (rayDistance + rayLength);
        const endY = sunCenterY + Math.sin(angle) * (rayDistance + rayLength);
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    // Nuages en verre
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.ellipse(size * 0.54, size * 0.58, 10 * scale, 6 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.ellipse(size * 0.46, size * 0.54, 6 * scale, 4 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Effet de brillance glassmorphisme
    ctx.globalAlpha = 0.3;
    const shineGradient = ctx.createLinearGradient(
        size * 0.25, size * 0.25,
        size * 0.5, size * 0.75
    );
    shineGradient.addColorStop(0, 'rgba(255,255,255,0.7)');
    shineGradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = shineGradient;
    ctx.beginPath();
    ctx.ellipse(size * 0.375, size * 0.33, 4 * scale, 12 * scale, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Logo "W" de WeatherGlass
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `bold ${12 * scale}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', size/2, size * 0.875);
    
    // Rétablir l'alpha
    ctx.globalAlpha = 1;
    
    // Retourner le data URL
    return canvas.toDataURL('image/png');
}

// Fonctions pour télécharger les icônes
function downloadIcon(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Générer et télécharger les icônes
function generateAllIcons() {
    console.log('Génération des icônes WeatherGlass...');
    
    // Icône 192x192
    const icon192 = createWeatherGlassIcon(192);
    downloadIcon(icon192, 'logo192.png');
    console.log('✅ logo192.png généré');
    
    // Icône 512x512
    const icon512 = createWeatherGlassIcon(512);
    downloadIcon(icon512, 'logo512.png');
    console.log('✅ logo512.png généré');
    
    // Icône 180x180 pour Apple
    const icon180 = createWeatherGlassIcon(180);
    downloadIcon(icon180, 'apple-touch-icon.png');
    console.log('✅ apple-touch-icon.png généré');
    
    console.log('🎉 Toutes les icônes ont été générées !');
    console.log('Remplacez les fichiers dans le dossier public/ par les nouveaux fichiers téléchargés.');
}

// Utilisation :
// 1. Ouvrez la console du navigateur (F12)
// 2. Copiez-collez ce script entier
// 3. Exécutez : generateAllIcons()

console.log('Script de génération d\'icônes WeatherGlass chargé.');
console.log('Exécutez generateAllIcons() pour générer toutes les icônes.');