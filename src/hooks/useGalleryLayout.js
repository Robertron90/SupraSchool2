import { useCallback, useEffect, useState, MutableRefObject } from 'react';
import { useRenderVideo } from './useRenderVideo';

const aspectRatio = 16 / 9;
const minCellWidth = 256;
const minCellHeight = minCellWidth / aspectRatio;
const cellOffset = 5;
const maxCount = 9;
const VideoQuality = {
  Video_90P: 0,
  Video_180P: 1,
  Video_360P: 2,
  Video_720P: 3,
};

const maxRowsColumns = (width, height) => ({
  maxColumns: Math.max(1, Math.floor(width / (minCellWidth + cellOffset * 2))),
  maxRows: Math.max(1, Math.floor(height / (minCellHeight + cellOffset * 2))),
});

const layoutCandidates = Array.from({ length: 9 })
  .map((value, index) => {
    const count = index + 1;
    const mid = Math.ceil(count / 2);
    const candidates = Array.from({ length: mid })
      .map((v, i) => {
        const row = i + 1;
        const column = Math.ceil(count / row);
        if (row < column) {
          return [
            {
              row,
              column,
            },
            {
              row: column,
              column: row,
            },
          ];
        }
        if (row === column) {
          return [
            {
              row,
              column,
            },
          ];
        }
        return [];
      })
      .reduce((prev, curr) => [...prev, ...curr], []);
    return { count, candidates };
  })
  .reduce((prev, curr) => ({ ...prev, [curr.count]: curr.candidates }), {});

function getVideoLayout(rootWidth, rootHeight, count) {
  /**
   * [1,count]
   */
  if (count > maxCount || count === 0) {
    return [];
  }
  let { maxRows, maxColumns } = maxRowsColumns(rootWidth, rootHeight);
  maxRows = Math.min(maxRows, count);
  maxColumns = Math.min(maxColumns, count);
  const actualCount = Math.min(count, maxRows * maxColumns);
  const layoutOfCount = layoutCandidates[actualCount].filter(
    (item) => item.row <= maxRows && item.column <= maxColumns
  );
  const preferredLayout = layoutOfCount
    .map((item) => {
      const { column, row } = item;
      const canonical = Math.floor(
        Math.min(rootWidth / (16 * column), rootHeight / (9 * row))
      );
      const cellWidth = canonical * 16 - cellOffset * 2;
      const cellHeight = canonical * 9 - cellOffset * 2;
      return {
        cellWidth,
        cellHeight,
        cellArea: cellWidth * cellHeight,
        column,
        row,
      };
    })
    .reduce(
      (prev, curr) => {
        if (curr.cellArea > prev.cellArea) {
          return curr;
        }
        return prev;
      },
      { cellArea: 0, cellHeight: 0, cellWidth: 0, column: 0, row: 0 }
    );
  const { cellWidth, cellHeight, column, row } = preferredLayout;
  const cellBoxWidth = cellWidth + cellOffset * 2;
  const cellBoxHeight = cellHeight + cellOffset * 2;
  const horizontalMargin = (rootWidth - cellBoxWidth * column) / 2 + cellOffset;
  const verticalMargin = (rootHeight - cellBoxHeight * row) / 2 + cellOffset;
  const cellDimensions = [];
  const lastRowColumns = column - ((column * row) % actualCount);
  const lastRowMargin =
    (rootWidth - cellBoxWidth * lastRowColumns) / 2 + cellOffset;
  let quality = VideoQuality.Video_90P;
  if (actualCount <= 4 && cellHeight >= 270) {
    quality = VideoQuality.Video_360P;
  } else if (actualCount > 4 && cellHeight >= 180) {
    quality = VideoQuality.Video_180P;
  }
  for (let i = 0; i < row; i++) {
    for (let j = 0; j < column; j++) {
      const leftMargin = i !== row - 1 ? horizontalMargin : lastRowMargin;
      if (i * column + j < actualCount) {
        cellDimensions.push({
          width: cellWidth,
          height: cellHeight,
          x: Math.floor(leftMargin + j * cellBoxWidth),
          y: Math.floor(verticalMargin + (row - i - 1) * cellBoxHeight),
          quality,
        });
      }
    }
  }
  return cellDimensions;
}

/**
 * Default order of video:
 *  1. video's participants first
 *  2. self on the second position
 */
export function useGalleryLayout(
  zmClient,
  mediaStream,
  isVideoDecodeReady,
  videoRef,
  dimension,
  pagination
) {
  const [visibleParticipants, setVisibleParticipants] = useState([]);
  const [layout, setLayout] = useState([]);
  const [subscribedVideos, setSubscribedVideos] = useState([]);
  const { page, pageSize, totalPage, totalSize } = pagination;
  let size = pageSize;
  if (page === totalPage - 1) {
    size = Math.min(size, totalSize % pageSize || size);
  }

  useEffect(() => {
    setLayout(getVideoLayout(dimension.width, dimension.height, size));
  }, [dimension, size]);
  const onParticipantsChange = useCallback(() => {
    const participants = zmClient.getAllUser();
    const currentUser = zmClient.getCurrentUserInfo();
    if (currentUser && participants.length > 0) {
      let pageParticipants = [];
      if (participants.length === 1) {
        pageParticipants = participants;
      } else {
        pageParticipants = participants
          .filter((user) => user.userId !== currentUser.userId)
          .sort(
            (user1, user2) => Number(user2.bVideoOn) - Number(user1.bVideoOn)
          );
        pageParticipants.splice(1, 0, currentUser);
        pageParticipants = pageParticipants.filter(
          (_user, index) => Math.floor(index / pageSize) === page
        );
      }
      setVisibleParticipants(pageParticipants);
      const videoParticipants = pageParticipants
        .filter((user) => user.bVideoOn)
        .map((user) => user.userId);
      setSubscribedVideos(videoParticipants);
    }
  }, [zmClient, page, pageSize]);
  useEffect(() => {
    zmClient.on('user-added', onParticipantsChange);
    zmClient.on('user-removed', onParticipantsChange);
    zmClient.on('user-updated', onParticipantsChange);
    return () => {
      zmClient.off('user-added', onParticipantsChange);
      zmClient.off('user-removed', onParticipantsChange);
      zmClient.off('user-updated', onParticipantsChange);
    };
  }, [zmClient, onParticipantsChange]);
  useEffect(() => {
    onParticipantsChange();
  }, [onParticipantsChange]);

  useRenderVideo(
    mediaStream,
    isVideoDecodeReady,
    videoRef,
    layout,
    subscribedVideos,
    visibleParticipants
  );
  return {
    visibleParticipants,
    layout,
  };
}
