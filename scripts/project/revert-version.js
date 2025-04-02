const fs = require('fs');
const path = require('path');

// 更新version.ts文件
const versionFilePath = path.join(__dirname, '../../libs/ngx-floating/src/version.ts');
const versionFileContent = `/**
 * 当前ngx-floating的版本号
 */
export const VERSION = 'dev';
`;

fs.writeFileSync(versionFilePath, versionFileContent, 'utf8');
console.log(`Version revert to ${version}`);
