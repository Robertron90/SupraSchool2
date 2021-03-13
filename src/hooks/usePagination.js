import { useState, useCallback, useEffect } from 'react';
import { useMount } from './useUnmount';

const maxRowsColumns = (width, height) => ({
  maxColumns: Math.max(1, Math.floor(width / (minCellWidth + cellOffset * 2))),
  maxRows: Math.max(1, Math.floor(height / (minCellHeight + cellOffset * 2))),
});

function maxViewportVideoCounts(width, height) {
  const { maxRows, maxColumns } = maxRowsColumns(width, height);
  return maxRows * maxColumns;
}

const MAX_NUMBER_PER_PAGE = 9;
// eslint-disable-next-line import/prefer-default-export
export function usePagination(zmClient, dimension) {
  const [page, setPage] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [pageSize, setPageSize] = useState(MAX_NUMBER_PER_PAGE);
  useEffect(() => {
    const size = Math.min(
      MAX_NUMBER_PER_PAGE,
      maxViewportVideoCounts(dimension.width, dimension.height),
    );
    setPageSize(size);
  }, [dimension]);
  const onParticipantsChange = useCallback(() => {
    setTotalSize(zmClient.getAllUser().length);
  }, [zmClient]);
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
  useMount(() => {
    setTotalSize(zmClient.getAllUser().length);
  });
  return {
    page,
    totalPage: Math.ceil(totalSize / pageSize),
    pageSize,
    totalSize,
    setPage,
  };
}
