import {
  UnorderedListOutlined,
  LoadingOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { Table, Spin, Button, message, Input, Space } from 'antd';
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { CREATE_LECTURE, GET_LECTURES } from '../api';

const { Search } = Input;

const LecturesEditor = () => {
  const { loading, error, data, refetch } = useQuery(GET_LECTURES);
  const [creating, setCreating] = useState(false);
  const [createLecture] = useMutation(CREATE_LECTURE);

  return (
    <div>
      <h2>Lessons Editor</h2>
      <Search
        style={{ marginBottom: '20px' }}
        placeholder="Lesson Name"
        allowClear
        enterButton="Create"
        size="large"
        loading={creating}
        onSearch={(value) => {
          setCreating(true);
          createLecture({ variables: { name: value } }).then(() => {
            setCreating(false);
            refetch();
          });
        }}
      />
      <Table
        loading={loading}
        dataSource={loading? undefined: data.introductionLectures}
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
          },
          {
            title: 'Link',
            dataIndex: 'id',
            key: 'link',
            render: (id) => (
              <div>
                <a href={`/joinLecture?id=${id}`}>{id}</a>
                <Button
                  style={{ marginLeft: '20px' }}
                  shape="circle"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/joinLecture?id=${id}`
                    );
                    message.success('Link Copied');
                  }}
                  icon={<CopyOutlined />}
                ></Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default LecturesEditor;
