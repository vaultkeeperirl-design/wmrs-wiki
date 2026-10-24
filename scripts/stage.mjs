import fs from 'node:fs/promises';
import path from 'node:path';
import {validate} from './validate.mjs';
const root=process.cwd();
await validate(root);
// A new directory every time: never move/delete the working game or an existing checkout.
const stagingRoot=path.join(root,'.staging');await fs.mkdir(stagingRoot,{recursive:true});
const destination=await fs.mkdtemp(path.join(stagingRoot,'wmrs-wiki-'));
const allowed=['package.json','package-lock.json','astro.config.mjs','tsconfig.json','.gitignore','.github','README.md','MAINTENANCE.md','AUDIT.md','src','public','data','scripts'];
for(const name of allowed)await fs.cp(path.join(root,name),path.join(destination,name),{recursive:true,dereference:false,errorOnExist:true});
await fs.mkdir(path.join(destination,'reports'));
for(const name of ['coverage.json','build-audit.json'])await fs.copyFile(path.join(root,'reports',name),path.join(destination,'reports',name));
const files=(await fs.readdir(destination,{recursive:true})).map(p=>p.replaceAll('\\','/'));
if(files.some(p=>/(^|\/)(\.env[^/]*|\.git|app\.asar|production\.env|\.review|node_modules)(\/|$)/.test(p)||p.includes('/dlc/')))throw new Error('Unexpected private/source payload in staging');
await fs.writeFile(path.join(root,'reports/staging.json'),JSON.stringify({destination,files:files.length},null,2)+'\n');
console.log(`Prepared a standalone repository at ${destination}. No GitHub repository created or content published.`);
