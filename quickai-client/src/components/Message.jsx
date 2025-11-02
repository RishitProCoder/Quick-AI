// src/components/Message.jsx
import React, { useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import moment from 'moment';
import Markdown from 'react-markdown';
import Prism from './PrismCodeLanguages';
import 'prismjs/themes/prism-tomorrow.css';

const SUPPORTED_LANGUAGES = [
  'javascript','python','java','c','cpp','go','ruby','r','kotlin',
  'swift','typescript','json','bash','yaml','markdown','docker','graphql','sql'
];

const Message = ({ message, isLast }) => {
  const lastMessageRef = useRef(null);
  const isUser = message.role === 'user' || message.sender === 'user';

  // Highlight code blocks for Markdown messages
  useEffect(() => {
    if (!message.isImage) {
      const codeBlocks = document.querySelectorAll('pre[class*="language-"]');
      codeBlocks.forEach((block) => {
        const lang = block.className.replace('language-', '');
        if (SUPPORTED_LANGUAGES.includes(lang)) {
          Prism.highlightElement(block);
        }
      });
    }
  }, [message.content, message.isImage]);

  // Scroll to last message
  useEffect(() => {
    if (isLast) lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLast]);

  const renderMarkdown = (content) => (
    <Markdown
      children={content}
      components={{
        code({ node, inline, className, children, ...props }) {
          const language = className?.replace('language-', '') || 'javascript';
          return !inline ? (
            <pre className={`language-${language} rounded-md overflow-auto p-2`} {...props}>
              <code className={`language-${language}`}>{children}</code>
            </pre>
          ) : (
            <code className="bg-gray-900 text-white px-1 rounded" {...props}>
              {children}
            </code>
          );
        },
        p({ node, children, ...props }) {
          if (children?.length && children[0]?.type === 'element' && children[0].props?.className?.includes('language-')) {
            return <>{children}</>;
          }
          return <p {...props}>{children}</p>;
        }
      }}
    />
  );

  return (
    <div ref={isLast ? lastMessageRef : null}>
      {isUser ? (
        <div className="flex items-start justify-end my-2 gap-2">
          <div className="flex flex-col gap-2 p-2 px-4 bg-purple-200 border border-purple-300 rounded-md max-w-2xl">
            {message.isImage ? (
              <img
                src={message.content}
                alt=""
                className="w-full max-w-md rounded-md"
              />
            ) : (
              renderMarkdown(message.content || message.text)
            )}
            <span className="text-xs text-gray-500">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-start my-2 gap-2">
          <div className="inline-flex flex-col gap-2 p-2 px-4 max-w-2xl bg-purple-200 border border-purple-300 rounded-md">
            {message.isImage ? (
              <img
                src={message.content}
                alt="AI generated"
                className="w-full max-w-md rounded-md"
              />
            ) : (
              renderMarkdown(message.content || message.text)
            )}
            <span className="text-xs text-gray-500">
              {moment(message.timestamp).fromNow()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Message;
