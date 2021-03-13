import React, { useCallback, useContext, useEffect, useState, useRef } from 'react';
import produce from 'immer';
import { Input } from 'antd';
import ZoomContext from '../context/zoom-context';
import { useParticipantsChange } from '../hooks/useParticipantsChange';
import ChatContext from '../context/chat-context';
import ChatMessageItem from './ChatMessageItem';
import ChatReceiverContainer from './ChatReceiver';
import { useMount } from '../hooks/useUnmount';

const ChatPrivilege = {
  All: 1,
  NoOne: 4,
  EveryonePublicly: 5,
}

const { TextArea } = Input;

const ChatContainer = () => {
  const zmClient = useContext(ZoomContext);
  const chatClient = useContext(ChatContext);
  const [chatRecords, setChatRecords] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(0);
  const [chatReceivers, setChatReceivers] = useState([]);
  const [chatPrivilege, setChatPrivilege] = useState(
    ChatPrivilege.All,
  );
  const [chatUser, setChatUser] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const chatWrapRef = useRef(null);
  const onChatMessage = useCallback(
    (payload) => {
      setChatRecords(
        produce((records) => {
          const length = records.length;
          if (length > 0) {
            const lastRecord = records[length - 1];
            if (
              payload.sender.userId === lastRecord.sender.userId &&
              payload.receiver.userId === lastRecord.receiver.userId &&
              payload.timestamp - lastRecord.timestamp < 1000 * 60 * 5
            ) {
              if (Array.isArray(lastRecord.message)) {
                lastRecord.message.push(payload.message);
              } else {
                lastRecord.message = [lastRecord.message, payload.message];
              }
            } else {
              records.push(payload);
            }
          } else {
            records.push(payload);
          }
        }),
      );
      if (chatWrapRef.current) {
        chatWrapRef.current.scrollTo(0, chatWrapRef.current.scrollHeight);
      }
    },
    [chatWrapRef],
  );
  const onChatPrivilegeChange = useCallback(
    (payload) => {
      setChatPrivilege(payload.chatPrivilege);
      if (chatClient) {
        setChatReceivers(chatClient.getReceivers());
      }
    },
    [chatClient],
  );
  const onChatInput = useCallback(
    (event) => {
      setChatDraft(event.target.value);
    },
    [],
  );
  useEffect(() => {
    zmClient.on('chat-on-message', onChatMessage);
    return () => {
      zmClient.off('chat-on-message', onChatMessage);
    };
  }, [zmClient, onChatMessage]);
  useEffect(() => {
    zmClient.on('chat-privilege-change', onChatPrivilegeChange);
    return () => {
      zmClient.off('chat-privilege-change', onChatPrivilegeChange);
    };
  }, [zmClient, onChatPrivilegeChange]);
  useParticipantsChange(zmClient, () => {
    if (chatClient) {
      setChatReceivers(chatClient.getReceivers());
    }
    setIsHost(zmClient.isHost());
    setIsManager(zmClient.isManager());
  });
  useEffect(() => {
    if (chatUser) {
      const index = chatReceivers.findIndex(
        (user) => user.userId === chatUser.userId,
      );
      if (index === -1) {
        setChatUser(chatReceivers[0]);
      }
    } else {
      if (chatReceivers.length > 0) {
        setChatUser(chatReceivers[0]);
      }
    }
  }, [chatReceivers, chatUser]);
  const setChatUserId = useCallback(
    (userId) => {
      const user = chatReceivers.find((u) => u.userId === userId);
      if (user) {
        setChatUser(user);
      }
    },
    [chatReceivers],
  );
  const sendMessage = useCallback(
    (event) => {
      event.preventDefault();
      if (chatUser && chatDraft) {
        chatClient?.send(chatDraft, chatUser?.userId);
        setChatDraft('');
      }
    },
    [chatClient, chatDraft, chatUser],
  );
  useMount(() => {
    setCurrentUserId(zmClient.getSessionInfo().userId);
    if (chatClient) {
      setChatPrivilege(chatClient.getPrivilege());
    }
  });
  return (
    <div className="chat-container">
      <div className="chat-wrap">
        <h2>Chat</h2>
        <div className="chat-message-wrap" ref={chatWrapRef}>
          {chatRecords.map((record) => (
            <ChatMessageItem
              record={record}
              currentUserId={currentUserId}
              setChatUser={setChatUserId}
              key={record.timestamp}
            />
          ))}
        </div>
        {ChatPrivilege.NoOne !== chatPrivilege || isHost || isManager ? (
          <>
            <ChatReceiverContainer
              chatUsers={chatReceivers}
              selectedChatUser={chatUser}
              isHostOrManager={isHost || isManager}
              chatPrivilege={chatPrivilege}
              setChatUser={setChatUserId}
            />
            <div className="chat-message-box">
              <TextArea
                onPressEnter={sendMessage}
                onChange={onChatInput}
                value={chatDraft}
                placeholder="Type message here ..."
              />
            </div>
          </>
        ) : (
          <div className="chat-disabled">Chat disabled</div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
