import React, { useState, useEffect } from 'react';
import { Table, Button, Input, /*Checkbox,*/ Layout, Space, Typography,message } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import UploadBibtex from "./components/uploadBibtex";
import UploadCsv from "./components/uploadCsv";
import {zeroShotClassification, extractKeywords, downloadCSV} from "./lib/functions";

const { Header, Content, Footer } = Layout;
const { Search } = Input;

const WebsmApp = () => {
    const [dataSource, setDataSource] = useState([]);
    //const [selected, setSelected] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFilteredData(dataSource);
    }, [dataSource]);


    const createKeywords = () =>{
        setDataSource(dataSource.map((item)=>({
            ...item, // Spread the existing item properties
            abstract_keywords: extractKeywords(item.abstract)
        })));
    }

    const downloadAction = ()=>{
        if(dataSource.length > 0){
            downloadCSV(dataSource,["name","abstract","abstract_score","title_score","abstract_keywords"])
        }
        else{
            message.error("No data to download");
        }
    }


    const classifyDataSource = async (dataSource,label) => {
        const results = await Promise.all(dataSource.map(async (item) => {
            const abstract_score = await zeroShotClassification(item.abstract, label);
            const title_score = await zeroShotClassification(item.title, label);

            // Returning the original item along with the scores
            return {
                ...item,
                abstract_score,
                title_score
            };
        }));
        console.log(results)
        return results;
    };
    const classifyArticles = (value) => {
        if(dataSource.length > 0) {
            console.log(value)
            classifyDataSource(dataSource,value)
                .then((classifiedData) => {
                    setDataSource(classifiedData);
                })
                .catch((error) => {
                    message.error("Error classifying data:", error);
                });
        }
        else{
            message.error("Write a term");
        }
    }
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
            render: (text) => <span title={text}>{text?.slice(0, 100)}...</span>, // Shorten abstract with tooltip
        },
        {
            title: 'Abstract Keywords',
            dataIndex: 'abstract_keywords',
            key: 'abstract_keywords',
            render: (_, record) => record?.abstract_keywords ?? 'not calculated',
        },
        {
            title: 'Title Score',
            dataIndex: 'title_score',
            key: 'title_score',
            render: (_, record) => record?.title_score ?? 'not calculated',
        },
        {
            title: 'Abstract Score',
            dataIndex: 'abstract_score',
            key: 'abstract_score',
            render: (_, record) => record?.abstract_score ?? 'not calculated',
        }/*,
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
        },*/
    ];

    return (
        <Layout>
            <Header>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Space align="center">
                        <UploadBibtex setData={setDataSource} />
                        <UploadCsv setData={setDataSource}  />
                        <Button onClick={createKeywords} type="default" >Predict Abstract Keywords</Button>
                    </Space>
                    <Search
                        placeholder="input classigy text"
                        allowClear
                        enterButton="Classify"
                        style={{width: '30%',paddingLeft:'2em'}}
                        onSearch={classifyArticles}
                    />
                    <Button type="default" onClick={downloadAction} style={{marginLeft: 'auto'}}>Export as CSV</Button>
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
