import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.1';
import nlp from 'compromise';


let model;
let instance;

const loadInstance = async () => {
    if(!instance){
        instance = await pipeline(
            "zero-shot-classification",
            "Xenova/bart-large-mnli",
            { device: "webgpu" },);
    }
}
// Load the Universal Sentence Encoder model
const loadModelOld = async () => {
    if (!model) {
        model = await use.load();
    }
    return model;
};

export const zeroShotClassification = async (text, candidateLabel) => {
    const score_label = await instance(text, [candidateLabel])
    return score_label[0]
}

// Function for zero-shot classification
export const zeroShotClassificationOld = async (text, candidateLabel) => {
    if(!text||!candidateLabel){
        return 0;
    }
    await loadModelOld();
    const embeddings = await model.embed([text, candidateLabel]);

    const textEmbedding = embeddings.arraySync()[0];  // Text embedding
    const labelEmbedding = embeddings.arraySync()[1]; // Only one label embedding

    // Calculate cosine similarity for classification score
    const score = 1 - tf.losses.cosineDistance(tf.tensor1d(textEmbedding), tf.tensor1d(labelEmbedding), 0).dataSync()[0];

    // Return the label and score
    return score;
};

// Function to extract keywords from text
export const extractKeywords = (text) => {
    const doc = nlp(text);
    const terms = doc.topics().out('array');
    return terms.length > 3 ? terms.slice(0, 3) : terms;
};

export const downloadCSV = (dataSource,collums) => {
    const csvRows = [];

    // Get the headers
    const headers = Object.keys(dataSource[0]).filter(item => collums.includes(item));
    csvRows.push(headers.join(',')); // Join headers with a comma

    // Get the data
    for (const row of dataSource) {
        const values = headers.map(header => {
            // Escape values that contain commas
            const escapedValue = String(row[header]).replace(/"/g, '""');
            return `"${escapedValue}"`; // Wrap in quotes
        });
        csvRows.push(values.join(',')); // Join row values with a comma
    }

    // Create a Blob and trigger download
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    // Create a link element
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.csv');

    // Append to the document and trigger download
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

loadModelOld();
loadInstance();