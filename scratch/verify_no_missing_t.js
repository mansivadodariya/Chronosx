const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.js', '.jsx']) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
                results = results.concat(getAllFiles(filePath, exts));
            }
        } else {
            if (exts.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = getAllFiles(path.join(__dirname, '..', 'src'));
console.log(`Checking ${files.length} files...`);

const missing = [];

for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/(?<![\w.$])t\s*\(/g.test(line)) {
            // Find enclosing function
            let foundTInScope = false;

            // Check if anywhere prior in file or in the function definition t is defined
            // 1. Is there `useLanguage` in file?
            const hasUseLanguage = /useLanguage\(/.test(code);
            const hasTInFile = /(?:const|let|var)\s*\{[^}]*\bt\b[^}]*\}\s*=/.test(code) ||
                               /(?:const|let|var)\s+t\s*=/.test(code) ||
                               /import\s+.*\bt\b.*from/.test(code);

            // Check if t is a prop in this file
            const hasTProp = /(?:function|\(?)\s*(?:[A-Za-z0-9_$]+)?\s*\(\s*\{[^}]*\bt\b[^}]*\}/.test(code) ||
                             /(?:function|\(?)\s*(?:[A-Za-z0-9_$]+)?\s*\([^)]*\bt\b[^)]*\)/.test(code);

            if (!hasTInFile && !hasTProp) {
                missing.push({ file, lineNum: i + 1, line: line.trim() });
                break;
            }
        }
    }
}

if (missing.length === 0) {
    console.log('SUCCESS: No files have undeclared `t(` calls!');
} else {
    console.log(`Found ${missing.length} files with undeclared t:`);
    missing.forEach(m => console.log(` - ${m.file}:${m.lineNum} -> ${m.line}`));
}
