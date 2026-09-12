const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'ypp 2027');
const outputFile = path.join(__dirname, 'products.js');

const products = [];
let idCounter = 1;

function traverseDirectory(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
            traverseDirectory(itemPath);
        } else {
            const ext = path.extname(item).toLowerCase();
            if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
                // Determine group from parent folder name
                const group = path.basename(currentPath);
                
                // Determine code from filename (strip extension and extra dots)
                const baseName = path.basename(item, ext);
                const code = baseName.replace(/\.+$/, '');
                
                // Relative path for web
                const relativePath = path.relative(__dirname, itemPath).replace(/\\/g, '/');
                
                products.push({
                    id: `${code}-${idCounter++}`,
                    code: code,
                    name: `Card ${code}`,
                    price: 0,
                    image: relativePath,
                    isFeatured: false,
                    colours: [],
                    styles: [],
                    occasions: [],
                    formats: [],
                    boxTypes: [],
                    finishes: [],
                    materials: [],
                    tags: [code, group],
                    group: group
                });
            }
        }
    }
}

traverseDirectory(targetDir);

// Sort by group then code
products.sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.code.localeCompare(b.code);
});

const fileContent = `const products = ${JSON.stringify(products, null, 4)};\n`;

fs.writeFileSync(outputFile, fileContent, 'utf-8');
console.log(`Successfully generated products.js with ${products.length} cards.`);
