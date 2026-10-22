let worker = null;
const pending = new Map();
let reqId = 0;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('../workers/ragWorker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => {
      const resolve = pending.get(data.id);
      if (resolve) {
        pending.delete(data.id);
        resolve(data);
      }
    };
    worker.onerror = (e) => {
      console.warn('RAG worker error:', e.message);
    };
  }
  return worker;
}

function send(type, payload) {
  return new Promise(resolve => {
    const id = ++reqId;
    pending.set(id, resolve);
    getWorker().postMessage({ id, type, payload });
  });
}

export function indexSourceWorker(source) {
  const slim = {
    id: source.id,
    videoId: source.videoId,
    type: source.type,
    title: source.title,
    rawText: source.rawText || source.content || '',
    transcript: source.type === 'youtube' ? source.transcript : undefined,
  };
  return send('INDEX', { source: slim });
}

export async function retrieveChunksWorker(sourceIds, query, k = 6) {
  const result = await send('RETRIEVE', { sourceIds, query, k });
  return result.chunks || [];
}
