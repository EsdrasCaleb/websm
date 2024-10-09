import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Checkbox, Layout, Space, Typography } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import UploadBibtex from "./components/uploadBibtex";
import UploadCsv from "./components/uploadCsv";
//import {zeroShotClassification, extractKeywords} from "./lib/functions";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const WebsmApp = () => {
    const [dataSource, setDataSource] = useState([]);
    const [selected, setSelected] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFilteredData(dataSource);
    }, [dataSource]);

    console.log(dataSource)


    const handleSearch = (value) => {
        setLoading(true);
        const filtered = dataSource.filter((item) =>
            item.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
        setLoading(false);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Abstract',
            dataIndex: 'abstract',
            key: 'abstract',
            render: (text) => <span title={text}>{text.slice(0, 100)}...</span>, // Shorten abstract with tooltip
        },
        {
            title: 'Citations',
            dataIndex: 'citations',
            key: 'citations',
        },
        {
            title: 'Select',
            render: (_, record) => (
                <Checkbox checked={selected.includes(record.key)}
                          onChange={(e)=>
                                  e.target.checked?
                                  setSelected([...new Set([...selected, record.key])]) :
                                  selected.filter(item => item !== record.key)
                            }
                />
            ),
        },
    ];

    return (
        <Layout>
            <Header>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Space align="center">
                        <UploadBibtex setData={setDataSource} />
                        <UploadCsv setData={setDataSource}  />
                    </Space>
                    <Button type="default" style={{marginLeft: 'auto'}}>Export as CSV</Button>
                </div>
            </Header>
            <Content style={{padding: '50px', textAlign: 'center'}}>
                <div style={{marginBottom: '20px', maxWidth: '600px', margin: 'auto'}}>
                    <Search
                        placeholder="Filter articles"
                        onSearch={handleSearch}
                        enterButton
                        style={{width: '100%'}}
                    />
                </div>
                {dataSource.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Typography>Upload a BibTeX or CSV to start</Typography>
                    </div>
                ) : (
                    <Table
                        dataSource={filteredData}
                        columns={columns}
                        pagination={{pageSize: 5}}
                        loading={loading}

                        style={{margin: 'auto', maxWidth: '1000px'}}
                    />
                )}
            </Content>
            <Footer style={{textAlign: 'center'}}>
                WebsmApp ©2024 Created by Caleb | <a href="https://github.com/EsdrasCaleb">My GitHub</a>
            </Footer>
        </Layout>
    );
};

export default WebsmApp;
