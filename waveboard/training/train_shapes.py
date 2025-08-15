import os
import random
import numpy as np
from PIL import Image, ImageDraw
import tensorflow as tf
from tensorflow.keras import layers, models
import json

# --- Configuration ---
IMG_SIZE = 64  # Input size for the model
NUM_CLASSES = 5
CLASSES = ["circle", "rectangle", "triangle", "diamond", "star"]
SAMPLES_PER_CLASS = 5000  # More samples = better model
TRAIN_SPLIT = 0.9
SAVE_PATH = os.path.join(os.path.dirname(__file__), "shape_model.h5")

# --- Image Generation Functions ---
def draw_shape(draw, shape_type):
    """Draws a specified shape with random variations."""
    outline_color = 255
    stroke_width = random.randint(2, 4)

    if shape_type == "circle":
        r = random.randint(12, 28)
        cx = random.randint(r + 4, IMG_SIZE - r - 4)
        cy = random.randint(r + 4, IMG_SIZE - r - 4)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=outline_color, width=stroke_width)
    elif shape_type == "rectangle":
        w, h = random.randint(20, 50), random.randint(20, 50)
        x1 = random.randint(4, IMG_SIZE - w - 4)
        y1 = random.randint(4, IMG_SIZE - h - 4)
        draw.rectangle([x1, y1, x1 + w, y1 + h], outline=outline_color, width=stroke_width)
    elif shape_type == "triangle":
        p1 = (random.randint(25, 45), random.randint(8, 20))
        p2 = (random.randint(8, 25), random.randint(40, 56))
        p3 = (random.randint(45, 60), random.randint(40, 56))
        draw.polygon([p1, p2, p3], outline=outline_color)
    elif shape_type == "diamond":
        cx, cy = IMG_SIZE // 2, IMG_SIZE // 2
        w, h = random.randint(24, 50), random.randint(24, 50)
        pts = [(cx, cy - h // 2), (cx + w // 2, cy), (cx, cy + h // 2), (cx - w // 2, cy)]
        draw.polygon(pts, outline=outline_color)
    elif shape_type == "star":
        # Simplified 5-point star
        cx, cy = IMG_SIZE // 2, IMG_SIZE // 2
        R, r = random.randint(18, 26), random.randint(8, 14)
        pts = []
        for i in range(10):
            angle = i * np.pi / 5 - np.pi / 2
            rad = R if i % 2 == 0 else r
            pts.append((cx + rad * np.cos(angle), cy + rad * np.sin(angle)))
        draw.polygon(pts, outline=outline_color)

def generate_image(label_index):
    """Creates a single training image."""
    img = Image.new("L", (IMG_SIZE, IMG_SIZE), 0) # Black background
    draw = ImageDraw.Draw(img)
    draw_shape(draw, CLASSES[label_index])
    return np.array(img, dtype=np.uint8)

# --- Model Building and Training ---
def build_dataset():
    X, y = [], []
    for i, shape_name in enumerate(CLASSES):
        print(f"Generating {SAMPLES_PER_CLASS} images for '{shape_name}'...")
        for _ in range(SAMPLES_PER_CLASS):
            X.append(generate_image(i))
            y.append(i)
    X = np.array(X, dtype=np.float32) / 255.0
    y = np.array(y, dtype=np.int32)
    X = X[..., np.newaxis]  # Add channel dimension: (N, H, W, 1)
    return X, y

def build_cnn_model():
    model = models.Sequential([
        layers.InputLayer(input_shape=(IMG_SIZE, IMG_SIZE, 1)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.Flatten(),
        layers.Dense(64, activation='relu'),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    X, y = build_dataset()
    
    # Shuffle data
    indices = np.arange(len(X))
    np.random.shuffle(indices)
    X, y = X[indices], y[indices]
    
    split_point = int(len(X) * TRAIN_SPLIT)
    X_train, X_test = X[:split_point], X[split_point:]
    y_train, y_test = y[:split_point], y[split_point:]

    model = build_cnn_model()
    model.summary()
    
    print("\nStarting model training...")
    model.fit(X_train, y_train, epochs=10, validation_data=(X_test, y_test), batch_size=128)
    
    print("\nSaving Keras model to:", SAVE_PATH)
    model.save(SAVE_PATH)

    # Save labels for the frontend
    labels_path = os.path.join(os.path.dirname(__file__), "shapes.json")
    with open(labels_path, 'w') as f:
        json.dump(CLASSES, f)
    print("Saved shape labels to:", labels_path)