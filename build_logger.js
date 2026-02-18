import { exec } from 'child_process';
import fs from 'fs';

console.log('Starting build...');
exec('npm run build', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error ? error.message : 'None'}`;
    fs.writeFileSync('build_result.log', output);
    console.log('Build finished. Log written to build_result.log');
    if (error) process.exit(1);
});
