import React, { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { CONFIRM } from '../src/api';
import { useRouter } from 'next/router';
import { Result, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const ConfirmAccount = () => {
  const [confirm, { data, loading, error }] = useMutation(CONFIRM);
  const router = useRouter();
  const [alert, setAlert] = useState({
    display: false,
    subtitle: '',
    title: '',
    type: '',
  });

  useEffect(() => {
    (async () => {
      const {
        query: { id, token },
      } = await router;
      await confirm({
        variables: { id: parseInt(id, 10), token },
      }).catch((reason) => {
        setAlert({
          display: true,
          title: 'Error!',
          subtitle: reason.toString(),
          type: 'error',
        });
      });
    })();
  }, [router.query]);

  if (loading && !alert.display) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 100,
        }}
      >
        <Spin
          tip="Loading..."
          indicator={<LoadingOutlined style={{ fontSize: 150 }} />}
        />
      </div>
    );
  }

  if (alert.display) {
    return (
      <Result
        subTitle={alert.subtitle}
        title={alert.title}
        status={alert.type}
      />
    );
  }

  if (error) {
    return (
      <div>
        <Result title="Error" subTitle={error.toString()} status="error" />
      </div>
    );
  }

  if (data) {
    return (
      <div>
        <Result
          title="success"
          subTitle={'Account confirmed now'}
          status="success"
        />
      </div>
    );
  }

  return <div>Loading</div>;
};

export default ConfirmAccount;
