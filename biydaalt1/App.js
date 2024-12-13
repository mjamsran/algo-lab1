import React, { useState } from 'react';
import './TextInput.css';

function TextInput() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWordIndex, setSelectedWordIndex] = useState(null); // For managing the selected incorrect word

  const handleInputChange = (event) => {
    setText(event.target.value);
  };

  const handleSpellCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from the backend');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError('Error communicating with the backend');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Function to underline incorrect words and display suggestions
  const renderTextWithErrorHighlight = () => {
    if (!result) return text;

    const words = text.split(/\s+/);
    const wordElements = [];

    words.forEach((word, index) => {
      const isIncorrect = result.incorrect_words.includes(word);
      const suggestions = result.suggestions[word] || [];

      if (isIncorrect) {
        wordElements.push(
          <span
            key={index}
            className="incorrect-word"
            onClick={() => setSelectedWordIndex(index)} // Set the selected word index for suggestions
          >
            {word}{' '}
            {selectedWordIndex === index && suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion, index)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </span>
        );
      } else {
        wordElements.push(<span key={index}>{word} </span>);
      }
    });

    return wordElements;
  };

  const handleSuggestionClick = (suggestion, index) => {
    // Replace the incorrect word with the selected suggestion
    const words = text.split(/\s+/);
    words[index] = suggestion;
    setText(words.join(' '));
    setSelectedWordIndex(null); // Close the suggestion dropdown after selection
  };

  return (
    <div className="container">
      <div className="input-wrapper">
        <textarea
          value={text}
          onChange={handleInputChange}
          placeholder="Энд дарж бичнэ үү"
          className="text-input"
          rows="10"
        />
        <div className="info-bar">
          <span>Үгийн тоо: {text.trim().split(/\s+/).filter((word) => word).length}</span>
          <span>Тэмдэгтийн тоо: {text.length}</span>
        </div>
        <button onClick={handleSpellCheck} className="spell-check-btn" disabled={loading}>
          {loading ? 'Тамга дарах...' : 'Алдааг шалгах'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div className="error-list">
          <h4>Алдаатай үгийн жагсаалт</h4>
          <p><strong>Зөв үгнүүд:</strong> {result.correct_words.join(', ')}</p>
          <p><strong>Буруу үгнүүд:</strong> {result.incorrect_words.join(', ')}</p>
          <p><strong>Үндэс үг:</strong> {result.processed_text}</p>
          <p><strong>Санал болгох үгс:</strong> {Object.entries(result.suggestions).map(([word, suggestions]) => (
            <span key={word}><strong>{word}:</strong> {suggestions.join(', ')} </span>
          ))}</p>
        </div>
      )}

      <div className="highlighted-text">
        {renderTextWithErrorHighlight()}
      </div>
    </div>
  );
}

export default TextInput;
