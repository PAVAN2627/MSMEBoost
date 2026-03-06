import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple markdown parser for common patterns
  const parseMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let inList = false;
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${key++}`} className="space-y-2 my-3 ml-2">
            {listItems.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span className="flex-1">{parseInline(item)}</span>
              </li>
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const parseInline = (text: string) => {
      const parts: (string | JSX.Element)[] = [];
      let remaining = text;
      let partKey = 0;

      // Process bold, italic, and inline code
      const patterns = [
        { regex: /\*\*(.+?)\*\*/g, render: (match: string) => <strong key={`bold-${partKey++}`} className="font-semibold text-foreground">{match}</strong> },
        { regex: /\*(.+?)\*/g, render: (match: string) => <em key={`italic-${partKey++}`} className="italic">{match}</em> },
        { regex: /`(.+?)`/g, render: (match: string) => <code key={`code-${partKey++}`} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{match}</code> },
      ];

      let processedText = text;
      const replacements: Array<{ start: number; end: number; element: JSX.Element }> = [];

      patterns.forEach(pattern => {
        const matches = [...processedText.matchAll(pattern.regex)];
        matches.forEach(match => {
          if (match.index !== undefined) {
            replacements.push({
              start: match.index,
              end: match.index + match[0].length,
              element: pattern.render(match[1])
            });
          }
        });
      });

      // Sort replacements by start position
      replacements.sort((a, b) => a.start - b.start);

      // Build parts array
      let lastIndex = 0;
      replacements.forEach(replacement => {
        if (replacement.start > lastIndex) {
          parts.push(processedText.substring(lastIndex, replacement.start));
        }
        parts.push(replacement.element);
        lastIndex = replacement.end;
      });

      if (lastIndex < processedText.length) {
        parts.push(processedText.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Empty line
      if (!trimmed) {
        flushList();
        if (elements.length > 0 && elements[elements.length - 1].type !== 'br') {
          elements.push(<br key={`br-${key++}`} />);
        }
        return;
      }

      // Horizontal rule (---)
      if (trimmed === '---' || trimmed === '___') {
        flushList();
        elements.push(<hr key={`hr-${key++}`} className="my-4 border-border" />);
        return;
      }

      // Blockquote (>)
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={`quote-${key++}`} className="border-l-4 border-primary pl-4 py-2 my-2 italic text-muted-foreground">
            {parseInline(trimmed.substring(2))}
          </blockquote>
        );
        return;
      }

      // Heading (## or ###)
      if (trimmed.startsWith('###')) {
        flushList();
        elements.push(
          <h4 key={`h4-${key++}`} className="font-semibold text-base text-foreground mt-3 mb-2">
            {trimmed.substring(3).trim()}
          </h4>
        );
        return;
      }

      if (trimmed.startsWith('##')) {
        flushList();
        elements.push(
          <h3 key={`h3-${key++}`} className="font-semibold text-lg text-foreground mt-4 mb-2">
            {trimmed.substring(2).trim()}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('#')) {
        flushList();
        elements.push(
          <h2 key={`h2-${key++}`} className="font-semibold text-xl text-foreground mt-4 mb-3">
            {trimmed.substring(1).trim()}
          </h2>
        );
        return;
      }

      // Bullet points (* or - or emoji bullets)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^[•✓✅📋💰📞🔗📝]\s/.test(trimmed)) {
        inList = true;
        const content = trimmed.replace(/^[*\-•✓✅📋💰📞🔗📝]\s/, '');
        listItems.push(content);
        return;
      }

      // Numbered list
      if (/^\d+\.\s/.test(trimmed)) {
        flushList();
        const content = trimmed.replace(/^\d+\.\s/, '');
        if (!inList) {
          inList = true;
        }
        listItems.push(content);
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${key++}`} className="text-sm leading-relaxed my-2">
          {parseInline(trimmed)}
        </p>
      );
    });

    flushList();
    return elements;
  };

  return <div className="space-y-1">{parseMarkdown(content)}</div>;
};

export default MarkdownRenderer;
