from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import hunspell

spell_checker = hunspell.HunSpell('mn_MN.dic', 'mn_MN.aff')

def spell_check(text):
    incorrect_words = []
    correct_words = []
    suggestions = {}

    # Split text into words and check spelling
    for word in text.split():
        if spell_checker.spell(word):
            correct_words.append(word)
        else:
            incorrect_words.append(word)
            # Generate suggestions for misspelled words
            suggestions[word] = spell_checker.suggest(word)
            

    # Construct final sentence with suggestions for incorrect words
    final_sentence = " ".join(correct_words)

    # Print outputs for debugging
    print("Зөв үгнүүд:", correct_words)
    print("Буруу үгнүүд:", incorrect_words)
    print("Үндэс үгнүүд: ", final_sentence)
    print("\nСанал болгох үгс:", suggestions)

    # Return processed data
    return {
        "incorrect_words": incorrect_words,
        "correct_words": correct_words,
        "suggestions": suggestions,
    }

class SpellCheckRequestHandler(BaseHTTPRequestHandler):

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)

        # Parse the received JSON
        try:
            request_json = json.loads(post_data)
            input_text = request_json.get('text', '')
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON format"}).encode('utf-8'))
            return

        # Perform spell check
        result = spell_check(input_text)

        # Send the response
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow all origins (for CORS)
        self.end_headers()
        self.wfile.write(json.dumps(result).encode('utf-8'))

    def do_OPTIONS(self):
        # Handle preflight requests for CORS
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# Start the server
def run(server_class=HTTPServer, handler_class=SpellCheckRequestHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f"Starting server on port {port}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()

                                                                                    