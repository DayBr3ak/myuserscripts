
const promisify = require('util').promisify;
const readFile = promisify(require('fs').readFile);
const writeFile = promisify(require('fs').writeFile);


async function main() {
    const code = await readFile('./build/main.bundle.js');
    const header = await readFile('./tabcompletion.header.js');

    const userScript = `${header}


    ${code}

    `;

    await writeFile('./tabcompletion.user.js', userScript);
}


main()
    .catch(console.error);
