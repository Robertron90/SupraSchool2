import React from 'react';
import { AudioMutedOutlined } from '@ant-design/icons';
import classNames from 'classnames';

const Avatar = (props) => {
  const { participant, style, isActive } = props;
  const { displayName, audio, muted, bVideoOn } = participant;
  return (
    <div
      className={classNames('avatar', { 'avatar-active': isActive })}
      style={{ ...style, background: bVideoOn ? 'transparent' : 'rgb(26,26,26)' }}
    >
      {(bVideoOn || (audio === 'computer' && muted)) && (
        <div className="corner-name">
          {audio === 'computer' && muted && (
            <AudioMutedOutlined style={{ color: '#f00' }} />
          )}
          {bVideoOn && <span>{displayName}</span>}
        </div>
      )}
      {!bVideoOn && <p className="center-name">{displayName}</p>}
    </div>
  );
};

export default Avatar;
