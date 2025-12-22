'use client';

import React from 'react';
import { PipelineRow, ProductMaster, MarketerMaster } from '@/types/pipeline';
import type { DatePreset } from '../hooks/usePipelineFilters';

import { exportPipelineExcelView } from './pipelineTable/exportExcelView';
import { usePipelineTableController } from './pipelineTable/usePipelineTableController';
import PipelineTableToolbar from './pipelineTable/PipelineTableToolbar';
import PipelineTableGrid from './pipelineTable/PipelineTableGrid';
import PipelineTablePagination from './pipelineTable/PipelineTablePagination';

interface PipelineTableProps {
  filteredPipelines: PipelineRow[];
  products: ProductMaster[];
  marketers: MarketerMaster[];
  loading: boolean;

  filterProductId: string;
  setFilterProductId: (v: string) => void;

  filterPlan: string;
  setFilterPlan: (v: string) => void;

  filterQuadrant: string;
  setFilterQuadrant: (v: string) => void;

  filterMarketerId: string;
  setFilterMarketerId: (v: string) => void;

  filterPriority: string;
  setFilterPriority: (v: string) => void;

  filterStatus: string;
  setFilterStatus: (v: string) => void;

  filterLeadSource: string;
  setFilterLeadSource: (v: string) => void;

  datePreset: DatePreset;
  setDatePreset: (v: DatePreset) => void;

  exportExcel: () => void; // legacy/raw export
  openDetailModal: (row: PipelineRow) => void;
  onEditRow: (row: PipelineRow) => void;
  onDeleteRow: (row: PipelineRow) => void;
  onCopyWARow: (row: PipelineRow) => void;
  onResetFilters: () => void;

  recentIds?: Record<string, number>;
}

export default function PipelineTable(props: PipelineTableProps) {
  const c = usePipelineTableController(props);

  const exportView = () => {
    exportPipelineExcelView({
      rows: c.sortedRows,
      datePreset: props.datePreset,

      filterProductId: props.filterProductId,
      filterMarketerId: props.filterMarketerId,
      filterPlan: props.filterPlan,
      filterQuadrant: props.filterQuadrant,
      filterStatus: props.filterStatus,
      filterLeadSource: props.filterLeadSource,
      filterPriority: props.filterPriority,

      search: c.search,
      sortKey: c.sortKey,
      sortDir: c.sortDir,

      productMap: c.productMap,
      marketerMap: c.marketerMap,

      getProductName: c.getProductName,
      getMarketerName: c.getMarketerName,
    });
  };

  return (
    <div className="space-y-3">
      <PipelineTableToolbar
        products={props.products}
        marketers={props.marketers}
        search={c.search}
        onChangeSearch={(v) => {
          c.setSearch(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterProductId={props.filterProductId}
        setFilterProductId={(v) => {
          props.setFilterProductId(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterMarketerId={props.filterMarketerId}
        setFilterMarketerId={(v) => {
          props.setFilterMarketerId(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterPlan={props.filterPlan}
        setFilterPlan={(v) => {
          props.setFilterPlan(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterQuadrant={props.filterQuadrant}
        setFilterQuadrant={(v) => {
          props.setFilterQuadrant(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterPriority={props.filterPriority}
        setFilterPriority={(v) => {
          props.setFilterPriority(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterStatus={props.filterStatus}
        setFilterStatus={(v) => {
          props.setFilterStatus(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        filterLeadSource={props.filterLeadSource}
        setFilterLeadSource={(v) => {
          props.setFilterLeadSource(v);
          c.setPage(1);
          c.setOpenMenuId(null);
        }}
        activePreset={c.activePreset}
        onApplyPreset={c.applyPreset}
        activeChips={c.activeChips}
        onResetAll={c.resetAll}
        onExportView={exportView}
        onExportRaw={props.exportExcel}
        totalRows={c.totalRows}
      />

      <PipelineTableGrid
        loading={props.loading}
        datePreset={props.datePreset}
        pagedRows={c.pagedRows}
        sortKey={c.sortKey}
        sortDir={c.sortDir}
        onSort={c.setSort}
        tableScrollRef={c.tableScrollRef}
        getProductName={c.getProductName}
        getMarketerName={c.getMarketerName}
        recentIds={props.recentIds}
        openMenuId={c.openMenuId}
        setOpenMenuId={c.setOpenMenuId}
        actionBtnRefs={c.actionBtnRefs}
        lastOpenedTriggerIdRef={c.lastOpenedTriggerIdRef}
        menuContainerRef={c.menuContainerRef}
        menuPositionClass={c.menuPositionClass}
        computePlacementForOpenMenu={c.computePlacementForOpenMenu}
        openDetailModal={props.openDetailModal}
        onEditRow={props.onEditRow}
        onCopyWARow={props.onCopyWARow}
        onDeleteRow={props.onDeleteRow}
        onResetFilters={props.onResetFilters}
        setDatePreset={props.setDatePreset}
      />

      <PipelineTablePagination
        currentPage={c.currentPage}
        totalPages={c.totalPages}
        onPrev={() => c.handleChangePage(c.currentPage - 1)}
        onNext={() => c.handleChangePage(c.currentPage + 1)}
      />
    </div>
  );
}
