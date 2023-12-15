const { execSync } = require('child_process');
const fs = require('fs');
const Handlebars = require('handlebars');

function downloadFile(url, filename) {
  execSync(`curl ${url} -o ${filename} -s`);
}

const version = process.argv[2];
const config = JSON.parse(fs.readFileSync(`./${version}/update.json`).toString());

const {
  path,
  files,
  lines: {
    start,
    end,
  }
} = config;

const baseUrl = 'https://raw.githubusercontent.com/docker-library/php'

files.forEach(file => {
  downloadFile(`${baseUrl}/${path}/${file}`, `${version}/${file}`)
});

const template = Handlebars.compile(fs.readFileSync(`./${version}/Dockerfile.hbs`).toString(), { noEscape: true });
const lines = fs.readFileSync(`./${version}/Dockerfile`).toString().split('\n');
const content = lines.slice(start, end).join('\n');
const result = template({ content });
fs.writeFileSync(`./${version}/Dockerfile`, result);

fs.readdirSync(version).forEach(file => {
  if (file.startsWith('docker-php-')) {
    execSync(`git add --chmod=+x ${version}/${file}`);
  }
});