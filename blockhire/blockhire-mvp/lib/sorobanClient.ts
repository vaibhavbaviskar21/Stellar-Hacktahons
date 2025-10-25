// Minimal helper to call the BlockHire backend from the Next.js frontend.
// Usage: import { uploadFile, invokeContract } from '../lib/sorobanClient';

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('http://localhost:4000/upload', {
    method: 'POST',
    body: fd,
  });
  return res.json();
}

export async function invokeContract({ contractId, functionName, args = [], source = 'blockhire-deployer', network = 'testnet' }: any) {
  const res = await fetch('http://localhost:4000/invoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId, functionName, args, source, network }),
  });
  return res.json();
}

// Example usage in a React component:
// const result = await uploadFile(file);
// await invokeContract({ contractId: 'CDKFG3...', functionName: 'hello', args: [{ name: 'to', value: result.file.filename }] });
