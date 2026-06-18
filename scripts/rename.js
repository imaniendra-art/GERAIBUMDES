const fs = require('fs');
const path = require('path');

const files = [
  "DEMO_CHECKLIST.md",
  "DEPLOYMENT.md",
  "package.json",
  "README.md",
  "scripts/seed.ts",
  "src/app/admin/layout.tsx",
  "src/app/admin/master/page.tsx",
  "src/app/cetak/[id]/page.tsx",
  "src/app/dashboard/page.tsx",
  "src/app/dashboard/pesanan/[id]/page.tsx",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/pesanan/[id]/page.tsx",
  "src/app/register/page.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/NavbarClient.tsx",
  "src/lib/auth.ts",
  "src/store/cartStore.ts",
  ".env.example",
  ".env.local",
  "scripts/reset-db.ts",
  "scripts/seed-sulsel-github.ts"
];

for (const file of files) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Exact domain match
    content = content.replace(/bumdesmart\.id/g, 'geraibumdes.com');
    content = content.replace(/BUMDESMART\.ID/g, 'GERAIBUMDES.COM');
    content = content.replace(/Bumdesmart\.id/g, 'GeraiBumdes.com');
    
    // Capitalized
    content = content.replace(/Bumdesmart/g, 'GeraiBumdes');
    content = content.replace(/BUMDESMART/g, 'GERAIBUMDES');
    
    // Lowercase
    content = content.replace(/bumdesmart/g, 'geraibumdes');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced in ${file}`);
  }
}
