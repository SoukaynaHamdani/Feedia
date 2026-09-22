import React from 'react';

export const stripMarkdown = (value = '') => String(value)
  .replace(/^\s*([-*_])(?:\s*\1){2,}\s*$/gm, '')
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/__(.*?)__/g, '$1')
  .replace(/\*([^*\n]+)\*/g, '$1')
  .replace(/_([^_\n]+)_/g, '$1')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/^\s*[-*+]\s+/gm, '')
  .replace(/^\s*#+\s+/gm, '')
  .replace(/:?-{3,}:?/g, ' ')
  .replace(/\|/g, ' ')
  .replace(/[ \t]{2,}/g, ' ')
  .trim();

export function FormattedText({ children }) {
  const text = stripMarkdown(children);
  const parts = text.split(/(\*\*.*?\*\*|__.*?__)/g);

  return parts.map((part, index) => {
    const isBold = (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'));
    const content = isBold ? part.slice(2, -2) : part;

    return isBold
      ? React.createElement('strong', { key: index }, content)
      : React.createElement(React.Fragment, { key: index }, content);
  });
}