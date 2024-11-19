import { useState, useEffect } from "react";

const Typewriter = ({
  words,
  delay,
  infinite,
}: {
  words: Array<string>;
  delay: number;
  infinite: boolean;
}) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  // keeping this here in case want multiple words, probably not though.
  const currWordIndex = 0;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentIndex <= words[currWordIndex].length - 1) {
      timeout = setTimeout(() => {
        setCurrentText(
          (prevText) => prevText + words[currWordIndex][currentIndex]
        );
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, delay, infinite, words]);

  return <span className="">{currentText}</span>;
};

export default Typewriter;
