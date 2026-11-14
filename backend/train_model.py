import joblib
from datasets import load_dataset
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

print("Downloading official dataset from Hugging Face...")
# Load from the correct, official namespace on Hugging Face Hub
dataset = load_dataset("cornell-movie-review-data/rotten_tomatoes", split="train")

texts = dataset["text"]
labels = dataset["label"]

X_train = []
y_train = []

# Take a solid chunk of real-world text for training accuracy
for text, label in zip(texts[:3000], labels[:3000]):
    X_train.append(text)
    if label == 0:
        y_train.append("Carrying Heavy Weight")
    else:
        y_train.append("Grounded & Light")

# Inject real-world casual phrases, slang, typos, and processing notes for your 3 tiers
extra_samples = [
    # Carrying Heavy Weight
    ("im so cooked rn everything is falling apart", "Carrying Heavy Weight"),
    ("fml cant deal with this anxiety anymore im exhausted", "Carrying Heavy Weight"),
    ("bro my mental health is actually in the dumpster today", "Carrying Heavy Weight"),
    ("carrying so much weight on my shoulders smh want to cry", "Carrying Heavy Weight"),
    ("panic attack is hitting hard cant even breathe properly", "Carrying Heavy Weight"),
    ("sterssed out of my mind and deadlines are killing me", "Carrying Heavy Weight"),
    
    # Reflecting & Processing
    ("just processing things today nothing major", "Reflecting & Processing"),
    ("feeling kinda tired but whatever taking it slow", "Reflecting & Processing"),
    ("meh average day trying to figure stuff out", "Reflecting & Processing"),
    ("working on my notes bit distracted tho", "Reflecting & Processing"),
    ("just going through the motions today", "Reflecting & Processing"),
    ("not bad, just thinking about a lot of stuff", "Reflecting & Processing"),

    # Grounded & Light
    ("vibin and feeling super productive today lets go", "Grounded & Light"),
    ("got everything done feeling so peaceful and calm", "Grounded & Light"),
    ("today was an absolute W feeling great", "Grounded & Light"),
    ("so grateful for the little things today ✨", "Grounded & Light"),
    ("feeling happy and highly motivated to code", "Grounded & Light")
]

# Multiply extra samples to give them strong representation alongside the review data
for text, label in extra_samples * 30:
    X_train.append(text)
    y_train.append(label)

# Build the ML Pipeline (TF-IDF Vectorizer + Logistic Regression)
model_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(ngram_range=(1, 2), stop_words='english', max_features=5000)),
    ('clf', LogisticRegression(max_iter=1000))
])

print("Training Machine Learning model on combined dataset...")
model_pipeline.fit(X_train, y_train)
print("Training complete!")

# Save the trained model file
joblib.dump(model_pipeline, "sentiment_model.pkl")
print("Model successfully saved as sentiment_model.pkl!")