import React, {
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useRouter } from 'next/router';
import ZoomContext from '../context/zoom-context';
import ZoomMediaContext from '../context/media-context';
import ChatContext from '../context/chat-context';
import produce from 'immer';
import Video from './Video';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../api';
import ZoomMtgCm from '@zoomus/instantsdk';

const mediaShape = {
  audio: {
    encode: false,
    decode: false,
  },
  video: {
    encode: false,
    decode: false,
  },
  share: {
    encode: false,
    decode: false,
  },
};

const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    default:
      break;
  }
}, mediaShape);

const Zoom = () => {
  const router = useRouter();
  const [loading, setIsLoading] = useState(true);
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState(null);
  const [chatCient, setChatClient] = useState(null);
  const [isFailover, setIsFailover] = useState(false);
  const zmClient = useContext(ZoomContext);
  const { userLoading, error, data } = useQuery(GET_USER);

  if (userLoading) {
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

  if (error) {
    router.push('/login');
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

  const { topic, signature, password } = router.query;
  const name =
    data === undefined ? '' : `${data.me.firstName} ${data.me.secondName}`;

  useEffect(() => {
    const init = async () => {
      await zmClient.init('en-US', `${window.location.origin}/lib`);
      try {
        console.log(topic, signature, name, password);
        await zmClient.join(topic, signature, name, password);
        setMediaStream(zmClient.getMediaStream());
        setChatClient(zmClient.getChatClient());
      } catch (e) {
        console.log(e);
      }
    };

    init();

    return () => {
      ZoomMtgCm.destroyClient();
    };
  }, [signature, zmClient, topic, name, password]);

  const onConnectionChange = useCallback(
    (payload) => {
      console.log(payload);
      if (payload.state === 'Reconnecting') {
        setIsLoading(true);
        setIsFailover(true);
        const { reason } = payload;
        if (reason === 'failover') {
          console.log('Session Disconnected');
        }
      } else if (payload.state === 'Connected') {
        setIsLoading(false);
      } else if (payload.state === 'Closed') {
        Model.warning({
          title: 'Session ended',
          content: 'This session has been ended by host',
        });
      }
    },
    [isFailover]
  );

  const onMediaSDKChange = useCallback((payload) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  useEffect(() => {
    zmClient.on('connection-change', onConnectionChange);
    zmClient.on('media-sdk-change', onMediaSDKChange);

    return () => {
      zmClient.off('connection-change', onConnectionChange);
      zmClient.off('media-sdk-change', onMediaSDKChange);
    };
  }, [zmClient, onConnectionChange, onMediaSDKChange]);

  return (
    <div>
      {loading && <p>Loading</p>}
      {!loading && (
        <ZoomMediaContext.Provider value={{ ...mediaState, mediaStream }}>
          <ChatContext.Provider value={chatCient}>
            <Video></Video>
          </ChatContext.Provider>
        </ZoomMediaContext.Provider>
      )}
    </div>
  );
};

export default Zoom;
