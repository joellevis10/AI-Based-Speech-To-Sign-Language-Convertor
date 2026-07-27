from flask import Flask, render_template, request, jsonify
import os
import spacy
import re

app = Flask(__name__)

# Load NLP model
nlp = spacy.load("en_core_web_sm")

GIF_DIR = os.path.join(app.root_path, "static", "gifs")

def normalize(text: str) -> str:
    text = text.strip().upper()
    text = re.sub(r"\s+", " ", text)
    return text

def preprocess_to_sign_words(text: str):
    doc = nlp(text)

    sign_words = []
    for token in doc:
        if token.is_stop or token.is_punct or token.is_space:
            continue
        sign_words.append(token.lemma_.upper())

    return sign_words


def find_gif(word: str):
    word = normalize(word)

    # Exact match
    p1 = os.path.join(GIF_DIR, f"{word}.gif")
    if os.path.exists(p1):
        return f"gifs/{word}.gif"

    # Underscore match
    p2 = os.path.join(GIF_DIR, f"{word.replace(' ', '_')}.gif")
    if os.path.exists(p2):
        return f"gifs/{word.replace(' ', '_')}.gif"

    return None


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/nlp", methods=["POST"])
def nlp_api():
    data = request.get_json()
    text = data.get("text", "")

    sign_words = preprocess_to_sign_words(text)

    result = []
    for w in sign_words:
        gif = find_gif(w)
        if gif:
            result.append({"word": w, "gif": "/static/" + gif})
        else:
            # fallback: show text if gif missing
            result.append({"word": w, "gif": None})

    return jsonify({"signs": result})


if __name__ == "__main__":
    app.run(debug=True)
