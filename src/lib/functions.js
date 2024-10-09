import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import nlp from 'compromise';

let model;

// Load the Universal Sentence Encoder model
const loadModel = async () => {
    if (!model) {
        model = await use.load();
    }
    return model;
};

// Function for zero-shot classification
export const zeroShotClassification = async (text, candidateLabels) => {
    await loadModel();
    const embeddings = await model.embed([text, ...candidateLabels]);

    const textEmbedding = embeddings.arraySync()[0];
    const labelEmbeddings = embeddings.arraySync().slice(1);

    // Calculate cosine similarity for classification scores
    const scores = labelEmbeddings.map((labelEmbedding) => {
        return tf.losses.cosineDistance(tf.tensor1d(textEmbedding), tf.tensor1d(labelEmbedding), 0).dataSync()[0];
    });

    // Pair scores with labels and return
    return candidateLabels.map((label, index) => ({ label, score: 1 - scores[index] }));
};

// Function to extract keywords from text
export const extractKeywords = (text) => {
    const doc = nlp(text);
    const terms = doc.topics().out('array');
    return terms.length > 3 ? terms.slice(0, 3) : terms;
};
