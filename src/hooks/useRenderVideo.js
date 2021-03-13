import { useEffect, MutableRefObject } from 'react';
import { usePrevious } from './usePrevious';
import { usePersistFn } from './usePersistFn';

export function isShallowEqual(objA, objB) {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if (
      objA[key] !== objB[key] ||
      !Object.prototype.hasOwnProperty.call(objB, key)
    ) {
      return false;
    }
  }

  return true;
}

export function useRenderVideo(
  mediaStream,
  isVideoDecodeReady,
  videoRef,
  layout,
  subscribedVideos,
  participants,
) {
  const previousSubscribedVideos = usePrevious(subscribedVideos);
  const previousLayout = usePrevious(layout);
  const previousParticipants = usePrevious(participants);
  const previousIsVideoDecodeReady = usePrevious(isVideoDecodeReady);
  useEffect(() => {
    if (videoRef.current && layout && layout.length > 0 && isVideoDecodeReady) {
      const addedSubscribers = subscribedVideos.filter(
        (id) => !(previousSubscribedVideos || []).includes(id),
      );
      const removedSubscribers = (previousSubscribedVideos || []).filter(
        (id) => !subscribedVideos.includes(id),
      );
      const unalteredSubscribers = subscribedVideos.filter((id) =>
        (previousSubscribedVideos || []).includes(id),
      );
      if (removedSubscribers.length > 0) {
        removedSubscribers.forEach(async (userId) => {
          await mediaStream?.stopRenderVideo(
            videoRef.current,
            userId,
          );
        });
      }
      if (addedSubscribers.length > 0) {
        addedSubscribers.forEach(async (userId) => {
          const index = participants.findIndex((user) => user.userId === userId);
          const cellDimension = layout[index];
          if (cellDimension) {
            const { width, height, x, y, quality } = cellDimension;
            await mediaStream?.renderVideo(
              videoRef.current,
              userId,
              width,
              height,
              x,
              y,
              quality,
            );
          }
        });
      }
      if (unalteredSubscribers.length > 0) {
        // layout changed
        if (
          previousLayout &&
          (layout.length !== previousLayout.length ||
            !isShallowEqual(layout[0], previousLayout[0]))
        ) {
          unalteredSubscribers.forEach((userId) => {
            const index = participants.findIndex((user) => user.userId === userId);
            const cellDimension = layout[index];
            if (cellDimension) {
              const { width, height, x, y } = cellDimension;
              mediaStream?.adjustRenderedVideoPosition(
                videoRef.current,
                userId,
                width,
                height,
                x,
                y,
              );
            }
          });
        }
        // the order of participants changed
        const participantsIds = participants.map((user) => user.userId);
        const previousParticipantsIds = previousParticipants?.map(
          (user) => user.userId,
        );
        if (participantsIds.join('-') !== previousParticipantsIds?.join('-')) {
          unalteredSubscribers.forEach((userId) => {
            const index = participantsIds.findIndex((id) => id === userId);
            const previousIndex = previousParticipantsIds?.findIndex(
              (id) => id === userId,
            );
            if (index !== previousIndex) {
              const cellDimension = layout[index];
              if (cellDimension) {
                const { width, height, x, y } = cellDimension;
                mediaStream?.adjustRenderedVideoPosition(
                  videoRef.current,
                  userId,
                  width,
                  height,
                  x,
                  y,
                );
              }
            }
          });
        }
      }
    }
  }, [
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    previousLayout,
    participants,
    previousParticipants,
    subscribedVideos,
    previousSubscribedVideos,
  ]);

  useEffect(() => {
    if (
      previousIsVideoDecodeReady === false &&
      isVideoDecodeReady === true &&
      subscribedVideos.length > 0
    ) {
      subscribedVideos.forEach(async (userId) => {
        const index = participants.findIndex((user) => user.userId === userId);
        const cellDimension = layout[index];
        if (cellDimension) {
          const { width, height, x, y, quality } = cellDimension;
          await mediaStream?.renderVideo(
            videoRef.current,
            userId,
            width,
            height,
            x,
            y,
            quality,
          );
        }
      });
    }
  }, [
    mediaStream,
    videoRef,
    layout,
    participants,
    subscribedVideos,
    isVideoDecodeReady,
    previousIsVideoDecodeReady,
  ]);
  const stopAllVideos = usePersistFn((videoCanvasDOM) => {
    if (subscribedVideos.length > 0) {
      subscribedVideos.forEach((userId) => {
        mediaStream?.stopRenderVideo(videoCanvasDOM, userId);
      });
    }
  });
  useEffect(() => {
    const videoCanvasDOM = videoRef.current;
    return () => {
      stopAllVideos(videoCanvasDOM);
    };
  }, [videoRef, stopAllVideos]);
}
