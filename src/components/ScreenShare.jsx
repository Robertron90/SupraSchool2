import React from 'react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';
import { createFromIconfontCN } from '@ant-design/icons';

const IconFont = createFromIconfontCN({
  scriptUrl: [
    '//at.alicdn.com/t/font_2183897_b5xllwmo50n.js', // icon-meeting
  ],
});

const ScreenShareButton = (props) => {
  const { isStartedScreenShare, onScreenShareClick } = props;
  return (
    <Tooltip
      title={isStartedScreenShare ? 'stop screen share' : 'start screen share'}
    >
      <Button
        className={classNames('screen-share-button', {
          'started-share': isStartedScreenShare,
        })}
        icon={<IconFont type="icon-share" />}
        // eslint-disable-next-line react/jsx-boolean-value
        ghost={true}
        shape="circle"
        size="large"
        onClick={onScreenShareClick}
      />
    </Tooltip>
  );
};

export default ScreenShareButton;
