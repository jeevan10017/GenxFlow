
import os
import tensorflow as tf
import tensorflow_datasets as tfds
from tensorflow.keras import layers, models
import json
import numpy as np

# --- Configuration ---
IMG_SIZE = 28
NUM_CLASSES = 62  # 10 digits + 26 uppercase + 26 lowercase
SAVE_PATH = os.path.join(os.path.dirname(__file__), "alphabet_model.h5")

# --- Data Loading and Preprocessing ---
def preprocess(sample):
    """Preprocesses the EMNIST ByClass dataset images."""
    # The images need to be rotated and flipped to be upright
    img = tf.image.rot90(sample['image'], k=3)
    img = tf.image.flip_left_right(img)
    img = tf.cast(img, tf.float32) / 255.0
    # The 'byclass' labels are already 0-61, so no adjustment is needed.
    label = sample['label']
    return img, label

# --- Model Building and Training ---
def build_cnn_model():
    """Builds a CNN model with 62 output classes."""
    model = models.Sequential([
        layers.InputLayer(input_shape=(IMG_SIZE, IMG_SIZE, 1)),
        layers.Conv2D(32, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        # The final layer must have 62 neurons for our 62 classes
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
    return model

if __name__ == "__main__":
    # Load the EMNIST 'byclass' dataset
    (ds_train, ds_test), ds_info = tfds.load(
        'emnist/byclass',
        split=['train', 'test'],
        shuffle_files=True,
        as_supervised=False,
        with_info=True,
    )

    ds_train = ds_train.map(preprocess).batch(256).prefetch(tf.data.AUTOTUNE)
    ds_test = ds_test.map(preprocess).batch(256).prefetch(tf.data.AUTOTUNE)

    model = build_cnn_model()
    model.summary()

    print("\nStarting model training on EMNIST ByClass (62 classes)...")
    model.fit(ds_train, epochs=10, validation_data=ds_test)

    print("\nSaving Keras model to:", SAVE_PATH)
    model.save(SAVE_PATH)

    # --- Generate the new labels file for the frontend ---
    # The EMNIST ByClass mapping is: 0-9, A-Z, a-z
    digits = [str(i) for i in range(10)]
    uppercase = [chr(ord('A') + i) for i in range(26)]
    lowercase = [chr(ord('a') + i) for i in range(26)]
    labels = digits + uppercase + lowercase

    labels_path = os.path.join(os.path.dirname(__file__), "alphabet.json")
    with open(labels_path, 'w') as f:
        json.dump(labels, f)
    print("Saved new alphabet labels (62 classes) to:", labels_path)