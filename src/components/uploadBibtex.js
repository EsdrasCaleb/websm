import React, { useState } from 'react';
import {  Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import bibtexParse from 'bibtex-parse-js'; // Ensure you have this library installed


const UploadBibtex = ({setData}) => {
    const [loading, setLoading] = useState(false);
    const handleBibtexUpload = (file) => {
        setLoading(true)
        const reader = new FileReader();
        reader.onload = (e) => {
            const bibtexContent = e.target.result;
            const parsedEntries = bibtexParse.toJSON(bibtexContent);

            const formattedData = parsedEntries.map((entry, index) => ({
                key: index,
                name: entry.entryTags.title || 'Unknown Title',
                abstract: entry.entryTags.abstract || 'No Abstract Available',
                citations: entry.entryTags.citation || 'Unknown Citation',
            }));

            setData(formattedData);
            message.success("BibTeX file uploaded successfully!");
            setLoading(false);
        };
        reader.readAsText(file);
        return false; // Prevent automatic upload
    };

    return (
        <Upload
            accept=".bib"
            beforeUpload={handleBibtexUpload}
            showUploadList={false}
            loading={loading}
        >
            <Button icon={<UploadOutlined />} type="primary" style={{ marginRight: '15px' }}>
                Upload BibTeX
            </Button>
        </Upload>
    );
};

export default UploadBibtex;
