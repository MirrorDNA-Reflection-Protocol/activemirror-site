// worker.js - WebLLM Worker Handler
// This keeps the engine in a separate thread, preventing garbage collection

import { WebWorkerMLCEngineHandler } from "https://esm.run/@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (msg) => {
    handler.onmessage(msg);
};
