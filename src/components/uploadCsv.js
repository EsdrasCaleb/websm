import React, { useState } from 'react';
import {  Button, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Papa from 'papaparse'; // CSV parsing library


const UploadCsv = ({setData,data}) => {
    const [loading, setLoading] = useState(false);
    const handleCSVUpload = (file) => {
        const reader = new FileReader();
        setLoading(true)
        reader.onload = (e) => {
            const csvContent = e.target.result;

            // Using PapaParse to parse CSV data
            Papa.parse(csvContent, {
                header: true, // Assumes the first row of the CSV is the header
                complete: (result) => {
                    const formattedData = result.data.map((row, index) => ({
                        key: index,
                        name: row.name || 'Unknown Title',
                        abstract: row.abstract || 'No Abstract Available',
                        citations: row.citations || 'Unknown Citation',
                    }));

                    setData(data.concat(formattedData)); // Populate the data into the table
                    message.success("CSV file uploaded successfully!");
                    setLoading(false)
                },
                error: () => {
                    message.error("There was an error processing the CSV file.");
                }
            });
        };

        reader.readAsText(file);
        return false; // Prevent automatic upload
    };

    return (
        <Upload
            accept=".csv"
            beforeUpload={handleCSVUpload}
            showUploadList={false}
            loading={loading}
        >
            <Button icon={<UploadOutlined />} type="primary" style={{ marginRight: '15px' }}>
                Upload CSV
            </Button>
        </Upload>
    );
};

export default UploadCsv;
