const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("shadowColor: '#000'")) {
        console.log(`Replacing in ${file}`);
        content = content.replace(/shadowColor:\s*'#000'/g, "shadowColor: theme.isDark ? 'transparent' : '#000'");
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'mindbridge-mobile', 'app', '(tabs)'));
console.log('Done.');
