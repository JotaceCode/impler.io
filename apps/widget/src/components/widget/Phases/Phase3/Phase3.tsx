import { Group, Text } from '@mantine/core';
import { HotTable } from '@handsontable/react';
import { useRef, useState, useEffect } from 'react';

import { PhasesEum } from '@types';
import { colors, TEXTS } from '@config';
import { IUpload } from '@impler/shared';
import { Download, Warning } from '@icons';
import { usePhase3 } from '@hooks/Phase3/usePhase3';

import useStyles from './Styles';
import { Button } from '@ui/Button';
import { Pagination } from '@ui/Pagination';
import { ConfirmModal } from '../ConfirmModal';
import { Table } from 'components/Common/Table';
import { Footer } from 'components/Common/Footer';
import { LoadingOverlay } from '@ui/LoadingOverlay';
import { logAmplitudeEvent, resetAmplitude } from '@amplitude';

interface IPhase3Props {
  onNextClick: (uploadData: IUpload) => void;
  onPrevClick: () => void;
}

export function Phase3(props: IPhase3Props) {
  const { classes } = useStyles();
  const tableRef = useRef<HotTable>(null);
  const { onNextClick, onPrevClick } = props;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const {
    page,
    headings,
    totalData,
    columnDefs,
    totalPages,
    reviewData,
    updateRecord,
    onPageChange,
    onExportData,
    setReviewData,
    onConfirmReview,
    isInitialDataLoaded,
    isConfirmReviewLoading,
  } = usePhase3({ onNext: onNextClick });
  const tableWrapperRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [tableWrapperDimensions, setTableWrapperDimentions] = useState({
    height: 200,
    width: 500,
  });

  useEffect(() => {
    //  setting wrapper height
    setTableWrapperDimentions({
      height: tableWrapperRef.current.getBoundingClientRect().height,
      width: tableWrapperRef.current.getBoundingClientRect().width,
    });
  }, []);

  const onConfirmClick = () => {
    setShowConfirmModal(true);
  };

  const onReviewConfirmed = (exempt: boolean) => {
    logAmplitudeEvent('CONFIRM', { exempt });
    resetAmplitude();
    setShowConfirmModal(false);
    onConfirmReview(exempt);
  };

  return (
    <>
      <LoadingOverlay visible={!isInitialDataLoaded || isConfirmReviewLoading} />
      <Group className={classes.textContainer} align="center" spacing="xs">
        <Group align="center" spacing="xs">
          <Warning fill={colors.red} className={classes.warningIcon} />
          <Text size="xs" inline color={colors.red} style={{ flex: 1 }}>
            {TEXTS.PHASE3.INVALID_DATA_INFO}
          </Text>
        </Group>
        <Button leftIcon={<Download />} onClick={onExportData}>
          {TEXTS.PHASE3.EXPORT_DATA}
        </Button>
      </Group>

      <div ref={tableWrapperRef} style={{ flexGrow: 1 }}>
        <Table
          width={tableWrapperDimensions.width}
          height={tableWrapperDimensions.height}
          ref={tableRef}
          onValueChange={(row, prop, oldVal, newVal) => {
            const name = String(prop).replace('record.', '');

            const currentData = [...reviewData];
            if (currentData && oldVal !== newVal) {
              if (!currentData[row].updated) {
                currentData[row].updated = {};
              }
              currentData[row].record[name] = newVal;
              currentData[row].updated[name] = true;
              setReviewData(currentData);
              updateRecord(currentData[row]);
            }
          }}
          data={reviewData}
          headings={headings}
          columnDefs={columnDefs}
        />
      </div>
      <Pagination page={page} total={totalPages} onChange={onPageChange} />

      <Footer
        primaryButtonLoading={isConfirmReviewLoading}
        active={PhasesEum.REVIEW}
        onNextClick={onConfirmClick}
        onPrevClick={onPrevClick}
      />

      <ConfirmModal
        onConfirm={onReviewConfirmed}
        onClose={() => setShowConfirmModal(false)}
        opened={showConfirmModal}
        wrongDataCount={totalData}
      />
    </>
  );
}
