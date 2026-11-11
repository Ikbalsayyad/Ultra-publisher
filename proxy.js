/**
 * UltraMinds Local Dev Server & Resilient CORS Proxy for NVIDIA NIM
 * Zero-dependency: uses only built-in Node.js modules (http, https, fs, path).
 * 
 * Features:
 * - Full CORS proxy for NVIDIA NIM (https://integrate.api.nvidia.com)
 * - Persistent TLS Agent with active TCP Keep-Alive to prevent connection drops (ECONNRESET)
 * - Automatic SSE streaming enforcement: NIM drops long non-streaming requests;
 *   proxy enforces stream: true to NVIDIA, streams tokens immediately without idle timeout,
 *   and reassembles chunks seamlessly for non-streaming clients or pipes SSE to streaming clients.
 * - Full support for all 81+ active models on build.nvidia.com
 * 
 * Usage:
 *   node proxy.js
 *   or: npm run proxy
 *   or: npm start
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;
const ROOT_DIR = path.resolve(__dirname);

// Persistent keep-alive agent with active socket maintenance
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 64,
  timeout: 300000
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xhtml': 'application/xhtml+xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.epub': 'application/epub+zip'
};

const server = http.createServer((req, res) => {
  // Always attach CORS headers for browser compatibility (including file:/// origins)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin, X-Requested-With, X-Provider, HTTP-Referer, X-Title, Access-Control-Request-Private-Network');
  res.setHeader('Access-Control-Allow-Private-Network', 'true');

  // Handle browser preflight CORS check
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check endpoint for automated proxy detection
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', proxy: 'ultraminds-nvidia-proxy', port: PORT }));
    return;
  }

  // NVIDIA NIM Proxy Endpoint
  if (req.url.startsWith('/nvidia') || req.url.startsWith('/v1/chat/completions') || req.url.startsWith('/v1/models')) {
    const targetPath = req.url.replace(/^\/nvidia/, '') || '/v1/chat/completions';
    const targetUrl = 'https://integrate.api.nvidia.com' + targetPath;

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('error', (err) => {
      console.error('[Client Request Error]', err.message);
      if (!res.headersSent) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: `Client error: ${err.message}` } }));
      }
    });

    req.on('end', () => {
      const bodyBuffer = Buffer.concat(chunks);
      let parsedBody = null;
      if (bodyBuffer.length > 0) {
        try {
          parsedBody = JSON.parse(bodyBuffer.toString('utf-8'));
        } catch (_) {}
      }

      // Check if this is a chat completions call
      const isChatCompletion = targetPath.includes('/chat/completions');
      const clientWantsStream = (req.headers['accept'] && req.headers['accept'].includes('text/event-stream')) ||
                                (parsedBody && parsedBody.stream === true);

      let outboundBuffer = bodyBuffer;

      // For NVIDIA NIM chat completions:
      // Always enforce stream: true when contacting NVIDIA to prevent idle connection resets (ECONNRESET)
      if (isChatCompletion && parsedBody && typeof parsedBody === 'object') {
        parsedBody.stream = true;
        outboundBuffer = Buffer.from(JSON.stringify(parsedBody), 'utf-8');
      }

      // Clean headers strictly matching official Python OpenAI SDK
      const cleanHeaders = {
        'host': 'integrate.api.nvidia.com',
        'content-type': req.headers['content-type'] || 'application/json',
        'accept': isChatCompletion ? 'text/event-stream, application/json' : (req.headers['accept'] || 'application/json'),
        'user-agent': 'OpenAI/Python 1.0 (UltraMinds NIM Proxy)',
        'connection': 'keep-alive'
      };

      if (req.headers['authorization']) {
        cleanHeaders['authorization'] = req.headers['authorization'];
      }
      if (req.headers['x-provider']) {
        cleanHeaders['x-provider'] = req.headers['x-provider'];
      }
      if (req.method === 'POST' || req.method === 'PUT') {
        cleanHeaders['content-length'] = outboundBuffer.length;
      }

      const modelName = parsedBody?.model || 'unknown-model';
      console.log(`[NVIDIA Proxy] 🚀 ${req.method} ${targetPath} (Model: ${modelName}, StreamEnforced: true, ClientStream: ${clientWantsStream})`);

      const proxyReq = https.request(targetUrl, {
        method: req.method,
        headers: cleanHeaders,
        agent: httpsAgent,
        timeout: 300000 // 5 minutes timeout for large AI models
      }, (proxyRes) => {
        const status = proxyRes.statusCode || 200;
        const responseHeaders = {
          'access-control-allow-origin': '*',
          'access-control-allow-headers': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
          'access-control-allow-private-network': 'true'
        };

        // If NVIDIA returned an error status (401, 403, 422, etc.), pass it directly to the client
        if (status >= 400 || !isChatCompletion) {
          responseHeaders['content-type'] = proxyRes.headers['content-type'] || 'application/json';
          res.writeHead(status, responseHeaders);
          proxyRes.pipe(res);
          return;
        }

        // If the client explicitly requested streaming, pipe SSE directly
        if (clientWantsStream) {
          responseHeaders['content-type'] = 'text/event-stream; charset=utf-8';
          responseHeaders['cache-control'] = 'no-cache';
          responseHeaders['connection'] = 'keep-alive';
          res.writeHead(status, responseHeaders);
          proxyRes.pipe(res);
          return;
        }

        // Non-streaming client: assemble SSE chunks into a standard OpenAI JSON completion object
        let fullContent = '';
        let resolvedModel = modelName;
        let completionId = 'chatcmpl-' + Date.now();
        let finishReason = 'stop';
        let sseBuffer = '';

        proxyRes.setEncoding('utf8');
        proxyRes.on('data', (chunk) => {
          sseBuffer += chunk;
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop(); // Keep uncompleted line in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data:')) continue;
            const dataStr = trimmed.replace(/^data:\s*/, '');
            if (dataStr === '[DONE]') continue;

            try {
              const json = JSON.parse(dataStr);
              if (json.id) completionId = json.id;
              if (json.model) resolvedModel = json.model;
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) fullContent += delta;
              if (json.choices?.[0]?.finish_reason) finishReason = json.choices[0].finish_reason;
            } catch (_) {}
          }
        });

        proxyRes.on('end', () => {
          // Flush any final line
          if (sseBuffer && sseBuffer.trim().startsWith('data:')) {
            const dataStr = sseBuffer.trim().replace(/^data:\s*/, '');
            if (dataStr !== '[DONE]') {
              try {
                const json = JSON.parse(dataStr);
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) fullContent += delta;
              } catch (_) {}
            }
          }

          const assembledResponse = {
            id: completionId,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: resolvedModel,
            choices: [
              {
                index: 0,
                message: {
                  role: 'assistant',
                  content: fullContent
                },
                finish_reason: finishReason || 'stop'
              }
            ]
          };

          responseHeaders['content-type'] = 'application/json; charset=utf-8';
          res.writeHead(200, responseHeaders);
          res.end(JSON.stringify(assembledResponse));
          console.log(`[NVIDIA Proxy] ✅ Completed: ${fullContent.length} chars generated for ${resolvedModel}`);
        });
      });

      proxyReq.on('timeout', () => {
        console.error('[NVIDIA Proxy Timeout] Request to NVIDIA timed out after 300s');
        proxyReq.destroy(new Error('NVIDIA NIM gateway timed out after 300s'));
      });

      proxyReq.on('error', (err) => {
        console.error('[NVIDIA Proxy Error]', err.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: { message: `NVIDIA Proxy Error: ${err.message}` } }));
        }
      });

      if (outboundBuffer.length > 0) {
        proxyReq.write(outboundBuffer);
      }
      proxyReq.end();
    });
    return;
  }

  // Serve static application files
  let urlPath = req.url.split('?')[0];
  let safePath = path.normalize(decodeURI(urlPath)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') safePath = '/index.html';
  const filePath = path.join(ROOT_DIR, safePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`\n=======================================================`);
  console.log(`🚀 UltraMinds Dev Server & NVIDIA CORS Proxy Active`);
  console.log(`=======================================================`);
  console.log(`📡 App URL:       http://localhost:${PORT}`);
  console.log(`🛡️ NVIDIA Proxy:  http://localhost:${PORT}/nvidia/v1/chat/completions`);
  console.log(`⚡ CORS Status:   Wildcard Access-Control-Allow-Origin: *`);
  console.log(`⚡ Streaming:     Auto-Enforced SSE Stream + Reassembly`);
  console.log(`=======================================================\n`);
});
