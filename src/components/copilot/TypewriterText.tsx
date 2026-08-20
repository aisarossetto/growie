import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  onCharacterTyped?: () => void;
  onComplete?: () => void;
  animate?: boolean;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 12,
  onCharacterTyped,
  onComplete,
  animate = true
}) => {
  const [displayedText, setDisplayedText] = useState(animate ? '' : text);
  const [isTyping, setIsTyping] = useState(animate);

  useEffect(() => {
    if (!animate) {
      setDisplayedText(text);
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      index++;
      // Type in chunks of 2-3 characters for ultra smooth fast response feel
      const nextText = text.slice(0, Math.min(index * 2, text.length));
      setDisplayedText(nextText);
      
      if (onCharacterTyped) {
        onCharacterTyped();
      }

      if (nextText.length >= text.length) {
        clearInterval(interval);
        setIsTyping(false);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, animate]);

  return (
    <div className="whitespace-pre-line font-sans relative">
      {displayedText}
      {isTyping && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-growie-purple animate-pulse align-middle" />
      )}
    </div>
  );
};
