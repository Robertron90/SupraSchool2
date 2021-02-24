import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Alert, Button, Checkbox, Col, Form, Input, Row, Spin } from 'antd';
import { LoadingOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER, LOGIN } from '../src/api';
import { useRouter } from 'next/router';

const Login = () => {
  const router = useRouter();
  const [disabled, setDisabled] = useState(false);
  const { loading, error, data } = useQuery(GET_USER);
  const [login] = useMutation(LOGIN);
  const [alert, setAlert] = useState({
    display: false,
    message: '',
  });
  const onFinish = async (values) => {
    setAlert({
      display: false,
      message: '',
    });
    setDisabled(true);
    await login({
      variables: { ...values },
    })
      .then((result) => {
        window.localStorage.setItem('__jwt', result.data.login.token);
        router.push('/');
      })
      .catch((result) => {
        console.log('here: ', result.toString());
        setDisabled(false);
        setAlert({
          display: true,
          message: <span>{result.toString()}</span>,
        });
      });
  };
  if (loading) {
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

  if (data) {
    router.push('/');
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

  return (
    <div>
      <Head>
        <title>Login</title>
      </Head>
      <div>
        <Row>
          <Col
            span={24}
            style={{
              minHeight: '100px',
            }}
          />
        </Row>
        <Row className="main-i">
          <Col span={8} />
          <Col span={5}>
            <div>
              <Form
                name="normal_login"
                className="login-form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
              >
                <div
                  style={{
                    marginBottom: '50px',
                    textAlign: 'center',
                  }}
                >
                  {alert.display && (
                    <Alert
                      message={alert.message}
                      type="error"
                      showIcon={true}
                    />
                  )}
                </div>

                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your E-mail!',
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="E-mail"
                  />
                </Form.Item>
                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your Password!',
                    },
                  ]}
                >
                  <Input
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    type="password"
                    placeholder="Password"
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={disabled}
                    className="login-form-button"
                  >
                    Log in
                  </Button>
                  Or <Link href="/register">register now!</Link>
                </Form.Item>
              </Form>
            </div>
          </Col>
          <Col span={11} />
        </Row>
      </div>
    </div>
  );
};

export default Login;
