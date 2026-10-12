const http = require('node:http');
const { readFile } = require('node:fs');
const { extname, resolve, sep } = require('node:path');
const releaseConfig = require('./release-config.js');

const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png' };

function createPreviewServer({allowLocalePreview = false} = {}) {
  return http.createServer((request, response) => {
  const rawPath = request.url.split('?')[0];
  const pathname = rawPath === '/' ? '/index.html' : rawPath;
  const filePath = resolve(root, '.' + pathname);
  if (!filePath.startsWith(root + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  if (pathname === '/release-config.js' && allowLocalePreview) {
    const config = {...releaseConfig, allowLocalePreview:true};
    response.writeHead(200, {'Content-Type':types['.js'], 'Cache-Control':'no-store'});
    response.end(`(function(root){const config=${JSON.stringify(config)};if(typeof module==='object'&&module.exports)module.exports=config;if(root)root.TrackReleaseConfig=config;})(typeof globalThis!=='undefined'?globalThis:this);`);
    return;
  }
  readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }
    response.writeHead(200, {
      'Content-Type': types[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    response.end(content);
  });
  });
}
if (require.main === module) createPreviewServer({allowLocalePreview:process.env.TRACK_LOCALE_PREVIEW === '1'}).listen(4173, '127.0.0.1');
module.exports = {createPreviewServer};
