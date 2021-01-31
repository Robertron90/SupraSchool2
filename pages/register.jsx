import React, { useState } from 'react';
import { Alert, Button, Col, Form, Input, Row, Spin } from 'antd';
import { useMutation, useQuery } from '@apollo/client';
import { GET_USER, REGISTER } from '../src/api';
import { useRouter } from 'next/router';
import { LoadingOutlined } from '@ant-design/icons';

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const Signup = () => {
  const { loading, error, data } = useQuery(GET_USER);
  const [register] = useMutation(REGISTER);
  const router = useRouter();

  const [form] = Form.useForm();
  const [disable, setDisabled] = useState(false);
  const [alert, setAlert] = useState({
    display: false,
    message: '',
  });

  const onFinish = async (values) => {
    console.log('values: ', values);
    setAlert({
      display: false,
      message: '',
    });
    setDisabled(true);
    await register({
      variables: { ...values },
    })
      .then((result) => {
        console.log('result: ', result);
        setAlert({
          display: true,
          message:
            'Account creation successful. Check your email for confirmation link',
        });
        router.push('/');
      })
      .catch((result) => {
        console.log('result: ', result.toString());
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

  return (
    <div>
      <Row
        style={{
          minHeight: '100px',
        }}
      >
        <Col span={9} />
        <span
          style={{
            fontSize: 30,
          }}
        >
          REGISTRATION
        </span>
        <Col span={8} />
      </Row>
      <Row>
        <Col span={6} />
        <Col span={8}>
          <Form
            {...formItemLayout}
            form={form}
            name="register"
            onFinish={onFinish}
            scrollToFirstError
          >
            <div
              style={{
                marginBottom: '50px',
                textAlign: 'center',
              }}
            >
              {alert.display && (
                <Alert message={alert.message} type="error" showIcon={true} />
              )}
            </div>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your first name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="secondName"
              label="Second Name"
              rules={[
                {
                  required: true,
                  message: 'Please input your second name!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                {
                  type: 'email',
                  message: 'The input is not valid E-mail!',
                },
                {
                  required: true,
                  message: 'Please input your E-mail!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone number"
              rules={[
                {
                  required: true,
                  message: 'Please input your phone number!',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              name="confirm"
              label="Confirm Password"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(
                      'The two passwords that you entered do not match!'
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" disabled={disable}>
                Register
              </Button>
            </Form.Item>
          </Form>
        </Col>
        <Col span={8} />
      </Row>
    </div>
  );
};

export default Signup;
