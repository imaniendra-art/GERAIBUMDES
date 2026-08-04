const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      if (file !== 'node_modules') {
        filelist = walkSync(dirFile, filelist);
      }
    } else {
      if (file === 'page.tsx') {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const pages = [...walkSync('src/app/dashboard'), ...walkSync('src/app/admin')];

pages.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Simple regex to find the main container (usually after `return (`)
  const match = content.match(/return\s*\(\s*<div[^>]*className=["']([^"']+)["']/i);
  if (match) {
    console.log(`${file}: \n  ${match[1]}`);
  } else {
    // If we can't find it easily with regex, try just finding the first div className
    const altMatch = content.match(/<div[^>]*className=["']([^"']+)["']/i);
    console.log(`${file}: \n  (fallback) ${altMatch ? altMatch[1] : 'NOT FOUND'}`);
  }
});
