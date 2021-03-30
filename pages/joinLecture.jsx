import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_LECTURE, GET_LECTURE, GET_USER } from '../src/api';
import { useRouter } from 'next/router';
import { Alert, Button, Col, Form, Input, Row, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const JoinLecture = () => {
  const router = useRouter();
  const [joinLecture] = useMutation(JOIN_LECTURE);
  const { id } = router.query;
  const { loading: userLoading, error: userError, data: userData } = useQuery(
    GET_USER
  );
  const { loading, error, data } = useQuery(GET_LECTURE, {
    variables: { id },
  });

  useEffect(() => {
    (async () => {
      if (!userData) {
        return;
      }

      const jitsiParams = (
        await joinLecture({
          variables: { id },
        })
      ).data.joinIntroductionLecture;

      router.push(
        `/jitsi?roomName=${jitsiParams.roomName}&signature=${jitsiParams.signature}`
      );
    })();
  }, [userData]);

  if (loading || userLoading) {
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
          tip="Please wait..."
          indicator={<LoadingOutlined style={{ fontSize: 150 }} />}
        />
      </div>
    );
  }

  const onFinish = async (values) => {
    const jitsiParams = (
      await joinLecture({
        variables: { id, ...values },
      })
    ).data.joinIntroductionLecture;

    router.push(
      `/jitsi?roomName=${jitsiParams.roomName}&signature=${jitsiParams.signature}`
    );
  };

  if (!userData) {
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
            Joining Lecture "{data.introductionLecture.name}"
          </span>
          <Col span={8} />
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
                <Form.Item
                  name="displayName"
                  label="Display Name"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your name!',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Join
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

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
        tip="Redirecting..."
        indicator={<LoadingOutlined style={{ fontSize: 150 }} />}
      />
    </div>
  );
};

export default JoinLecture;
