"use client"
import React from 'react'

export default function TxViewer({ hash }: { hash: string }) {
  const url = `https://stellar.expert/explorer/testnet/tx/${hash}`
  return (
    <div style={{ marginLeft: 12 }}>
      <div>Tx: <a href={url} target="_blank" rel="noreferrer">{hash}</a></div>
    </div>
  )
}
