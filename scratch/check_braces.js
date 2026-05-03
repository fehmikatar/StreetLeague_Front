const fs = require('fs');
const content = fs.readFileSync('src/app/pages/team-chat.component.ts', 'utf8');
let balance = 0;
const lines = content.split('\n');
lines.forEach((line, i) => {
    for (let char of line) {
        if (char === '{') balance++;
        if (char === '}') balance--;
    }
    if (i + 1 === 881) {
        console.log(`Balance at line 881: ${balance}`);
    }
});
console.log(`Final balance: ${balance}`);
