import React, { useState, useEffect, useRef, useCallback, useMemo, DragEvent, useLayoutEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { cn } from '@/lib/utils';
import { useLocalStorage } from 'usehooks-ts';
import { GripVertical, Eye, EyeOff, GripVertical as Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import styles from './DataTable.module.css';

// Custom media query hook with proper type safety and SSR support
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Custom hook for managing column widths with localStorage
const useColumnWidths = (defaultWidths: { [key: string]: number }): [{ [key: string]: number }, (key: string, width: number) => void, () => void] => {
  const [widths, setWidths] = useLocalStorage<{ [key: string]: number }>('columnWidths', defaultWidths);

  const updateWidth = useCallback((key: string, width: number) => {
    setWidths((prev: { [key: string]: number }) => ({
      ...prev,
      [key]: width
    }));
  }, [setWidths]);

  const resetWidths = useCallback(() => {
    setWidths(defaultWidths);
  }, [defaultWidths, setWidths]);

  return [widths || defaultWidths, updateWidth, resetWidths];
};

type AnyObject = Record<string, unknown>;

// Tooltip wrapper component for truncated text
const OverflowTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textRef.current) {
      const { scrollWidth, clientWidth } = textRef.current;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, [content]);

  if (!isOverflowing) {
    return <div ref={textRef} className="truncate">{children}</div>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={textRef} className="truncate">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-md break-words">
        {content}
      </TooltipContent>
    </Tooltip>
  );
};

type ColumnDefinition<T> = {
  key: keyof T;
  header: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  visible?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  cellClassName?: string;
  headerClassName?: string;
};

interface DragState {
  isDragging: boolean;
  sourceIndex: number;
  targetIndex: number | null;
  startX: number;
  currentX: number;
  columnWidth: number;
}

type DataTableProps<T> = {
  columns: ColumnDefinition<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  className?: string;
  rowHeight?: number;
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  footerContent?: React.ReactNode;
};

// Helper component for rendering cell content with tooltip
const TableCellWithTooltip = ({ value, className = '' }: { value: React.ReactNode, className?: string }) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    if (cellRef.current) {
      const { scrollWidth, clientWidth } = cellRef.current;
      setIsOverflowing(scrollWidth > clientWidth);
    }
  }, [value]);

  const content = (
    <div ref={cellRef} className={`${styles.truncatedCell} ${className}`}>
      {value}
    </div>
  );

  if (!isOverflowing || typeof value !== 'string') {
    return content;
  }

  return (
    <div className={styles.tooltip}>
      {content}
      <span className={styles.tooltipText}>{value}</span>
    </div>
  );
};

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  className,
  rowHeight = 48,
  stickyHeader = true,
  stickyFooter = false,
  footerContent,
}: DataTableProps<T>) {
  // Use a more specific type for column widths with explicit index signature
  type ColumnWidths = { [key: string]: number };

  // Initialize with empty object and proper type
  const [columnWidths, setColumnWidths] = useLocalStorage<ColumnWidths>('dataTableColumnWidths', {});

  // Memoize safeColumnWidths to prevent unnecessary recalculations
  const safeColumnWidths: ColumnWidths = useMemo(
    () => columnWidths || {},
    [columnWidths]
  );

  // Helper function to safely update column widths
  const updateColumnWidth = useCallback((columnKey: string, width: number) => {
    const key = getKeyString(columnKey);
    setColumnWidths((prev = {}) => ({
      ...prev,
      [key]: width
    }));
  }, [setColumnWidths]);

  const [hiddenColumns, setHiddenColumns] = useLocalStorage<string[]>(
    'dataTableHiddenColumns',
    []
  ) as [string[], (value: string[]) => void];

  // Convert column key to string for consistent comparison
  const getKeyString = useCallback((key: string | number | symbol): string => {
    if (typeof key === 'symbol') {
      return key.toString();
    }
    return String(key);
  }, []);

  // Convert column keys to strings for comparison
  const isColumnHidden = useCallback((key: string | number | symbol): boolean => {
    return hiddenColumns.includes(getKeyString(key));
  }, [hiddenColumns, getKeyString]);

  const tableRef = useRef<HTMLTableElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeColumn, setResizeColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeCurrentWidth, setResizeCurrentWidth] = useState<number | null>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Handle column resizing
  const startResize = useCallback((e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const columnElement = document.querySelector(`[data-column-key="${columnKey}"]`) as HTMLElement;
    if (!columnElement) return;
    
    setIsResizing(true);
    setResizeColumn(columnKey);
    setResizeStartX(e.clientX);
    setResizeStartWidth(columnElement.offsetWidth);
    
    // Add event listeners
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = resizeStartWidth + (e.clientX - resizeStartX);
      setResizeCurrentWidth(newWidth);
    };
    
    const onMouseUp = () => {
      if (resizeColumn && resizeCurrentWidth !== null) {
        updateColumnWidth(resizeColumn, Math.max(100, resizeCurrentWidth));
      }
      setIsResizing(false);
      setResizeColumn(null);
      setResizeCurrentWidth(null);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp, { once: true });
  }, [isResizing, resizeColumn, resizeCurrentWidth, resizeStartWidth, resizeStartX, updateColumnWidth]);

  // State for column reordering
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    sourceIndex: -1,
    targetIndex: null,
    startX: 0,
    currentX: 0,
    columnWidth: 0
  });

  // Track the dragged column element
  const draggedColumnRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Initialize visible columns from props
  const [visibleColumns, setVisibleColumns] = useState<ColumnDefinition<T>[]>(() => 
    columns.filter(column => column.visible !== false)
  );

  // Update visible columns when columns prop changes
  useEffect(() => {
    setVisibleColumns(prev => {
      const visibleKeys = new Set(prev.map(col => getKeyString(col.key)));
      return columns.filter(column => 
        column.visible !== false || visibleKeys.has(getKeyString(column.key))
      );
    });
  }, [columns, getKeyString]);
  
  // Toggle column visibility
  const toggleColumnVisibility = useCallback((key: string) => {
    setVisibleColumns(prev => {
      const isVisible = prev.some(col => getKeyString(col.key) === key);
      if (isVisible) {
        return prev.filter(col => getKeyString(col.key) !== key);
      }
      const columnToAdd = columns.find(col => getKeyString(col.key) === key);
      return columnToAdd ? [...prev, columnToAdd] : prev;
    });
  }, [columns, getKeyString]);
  
  // Handle context menu for column visibility toggling
  const handleContextMenu = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    toggleColumnVisibility(columnKey);
  };

  // Handle column reordering
  const handleDragStart = (e: React.DragEvent<HTMLTableCellElement>, columnIndex: number) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    // Create a clone of the header for dragging
    const clone = target.cloneNode(true) as HTMLTableCellElement;
    clone.style.position = 'fixed';
    clone.style.top = '-1000px';
    clone.style.left = '-1000px';
    clone.style.width = `${rect.width}px`;
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.8';
    clone.style.zIndex = '1000';
    clone.style.transform = 'translate(-50%, -50%)';
    clone.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    clone.style.backgroundColor = 'white';
    clone.style.border = '1px solid #e5e7eb';
    clone.style.borderRadius = '4px';
    document.body.appendChild(clone);
    draggedColumnRef.current = clone;

    setDragState({
      isDragging: true,
      sourceIndex: columnIndex,
      targetIndex: null,
      startX: e.clientX,
      currentX: e.clientX,
      columnWidth: rect.width
    });

    // Set drag image to a transparent image
    const dragImage = new Image();
    dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>, columnIndex: number) => {
    e.preventDefault();
    if (!dragState.isDragging) return;

    // Update the dragged column position
    if (draggedColumnRef.current) {
      draggedColumnRef.current.style.left = `${e.clientX}px`;
      draggedColumnRef.current.style.top = `${e.clientY}px`;
    }

    // Only update target index if it's actually changing
    setDragState(prev => {
      if (prev.targetIndex === columnIndex) return prev;
      return {
        ...prev,
        currentX: e.clientX,
        targetIndex: columnIndex
      };
    });
  };

  const handleDragEnd = () => {
    if (draggedColumnRef.current && document.body.contains(draggedColumnRef.current)) {
      document.body.removeChild(draggedColumnRef.current);
      draggedColumnRef.current = null;
    }

    if (!dragState.isDragging || dragState.targetIndex === null) {
      setDragState(prev => ({ ...prev, isDragging: false }));
      return;
    }

    // Only reorder if the position actually changed
    if (dragState.sourceIndex !== dragState.targetIndex) {
      const newColumns = [...visibleColumns];
      const [movedColumn] = newColumns.splice(dragState.sourceIndex, 1);
      newColumns.splice(dragState.targetIndex, 0, movedColumn);
      setVisibleColumns(newColumns);
    }

    setDragState(prev => ({ ...prev, isDragging: false }));
  };

  const getColumnWidth = useCallback((columnKey: string | number | symbol, defaultWidth = 150): number => {
    if (!columnKey) return defaultWidth;
    const key = getKeyString(columnKey);
    return safeColumnWidths[key] ?? defaultWidth;
  }, [safeColumnWidths]);

  // Calculate total width of all visible columns
  const totalWidth = useMemo(() => {
    return visibleColumns.reduce((sum, col) => {
      return sum + getColumnWidth(col.key, col.width || 150);
    }, 0);
  }, [visibleColumns, getColumnWidth]);

  // Helper to safely get string key from column definition
  const getColumnKeyString = (column: ColumnDefinition<T>): string => {
    return getKeyString(column.key);
  };

  const renderTableHeader = () => {
    return (
      <TableHeader className={cn(styles.tableHeader, { [styles.stickyHeader]: stickyHeader })}>
        <TableRow>
          {visibleColumns.map((column, columnIndex) => {
            const columnKey = column.key as string;
            const isHidden = isColumnHidden(columnKey);
            if (isHidden) return null;

            const width = getColumnWidth(columnKey, column.width);
            const currentWidth = resizeColumn === columnKey && resizeCurrentWidth !== null 
              ? resizeCurrentWidth 
              : width;
            const isLastColumn = columnIndex === visibleColumns.length - 1;
            const isResizingThisColumn = resizeColumn === columnKey && isResizing;

            return (
              <TableHead
                key={columnKey}
                data-column-key={columnKey}
                className={cn(
                  styles.tableHeaderCell,
                  column.headerClassName,
                  dragState.isDragging && dragState.sourceIndex === columnIndex && styles.draggingColumn,
                  isLastColumn && 'border-r-0',
                  'group relative',
                  isResizingThisColumn && 'select-none'
                )}
                style={{
                  width: `${currentWidth}px`,
                  minWidth: column.minWidth ? `${column.minWidth}px` : '100px',
                  maxWidth: column.maxWidth ? `${column.maxWidth}px` : 'none',
                  cursor: dragState.isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
                onMouseDown={(e) => handleHeaderMouseDown(e, columnIndex, currentWidth)}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="truncate pr-2">{column.header}</div>
                  <div className="flex items-center">
                    <GripVertical className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </div>
                </div>
                
                {/* Resize handle */}
                <div 
                  ref={resizeHandleRef}
                  className={cn(
                    styles.resizeHandle,
                    isResizingThisColumn && styles.resizeHandleActive
                  )}
                  onMouseDown={(e) => startResize(e, columnKey)}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
    );
  };

  const renderTableBody = () => {
    if (data.length === 0) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }

    return (
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            className={cn(
              'hover:bg-gray-50 transition-colors',
              onRowClick && 'cursor-pointer',
              isResizing && 'pointer-events-none',
              'group'
            )}
            onClick={() => onRowClick?.(row)}
          >
            {visibleColumns.map((column) => {
              const columnKey = column.key as string;
              if (isColumnHidden(columnKey)) return null;

              const cellValue = row[column.key];
              const renderedValue = column.render
                ? column.render(cellValue, row)
                : String(cellValue || '');

              const width = getColumnWidth(columnKey, column.width);
              const currentWidth = resizeColumn === columnKey && resizeCurrentWidth !== null 
                ? resizeCurrentWidth 
                : width;

              return (
                <TableCell
                  key={columnKey}
                  className={cn(
                    'py-2 relative',
                    column.cellClassName,
                    isResizing && 'pointer-events-none',
                    'group-hover:bg-gray-50 transition-colors'
                  )}
                  style={{
                    height: `${rowHeight}px`,
                    width: `${currentWidth}px`,
                    minWidth: column.minWidth ? `${column.minWidth}px` : '100px',
                    maxWidth: column.maxWidth ? `${column.maxWidth}px` : 'none',
                  }}
                >
                  <TableCellWithTooltip value={renderedValue} />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    );
  };

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  // Set the minimum width for the table container
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.style.setProperty('--table-min-width', `${totalWidth}px`);
    }
  }, [totalWidth]);

  // Handle scrollbar class for the table container
  useEffect(() => {
    const container = scrollableContainerRef.current;
    if (container) {
      container.classList.add(styles.scrollableContainer);
      return () => {
        container.classList.remove(styles.scrollableContainer);
      };
    }
  }, []);

  // Desktop table view with fixed header and scrollable body
  const renderTableView = () => {
    return (
      <div className={styles.tableWrapper}>
        {/* Fixed Header */}
        <div className={styles.tableHeaderContainer}>
          <Table className={cn(styles.table, styles.fixedTableLayout)}>
            {renderTableHeader()}
          </Table>
        </div>
        
        {/* Scrollable Body */}
        <div
          ref={scrollableContainerRef}
          className={cn(styles.scrollableContainer, 'no-scrollbar')}
        >
          <Table className={cn(styles.table, styles.fixedTableLayout)}>
            {renderTableBody()}
          </Table>
        </div>
      </div>
    );
  };

  // Mobile card view renderer
  const renderMobileView = () => (
    <div className="space-y-2">
      {data.map((row, rowIndex) => (
        <Card key={rowIndex} className="p-4">
          <div className="space-y-2">
            {visibleColumns.map((column) => {
              const value = row[column.key];
              const content = column.render ? column.render(value, row) : String(value || '');

              return (
                <div key={column.key as string} className="grid grid-cols-2 gap-2">
                  <div className="text-sm font-medium text-gray-500">{column.header}</div>
                  <div className="truncate">
                    <OverflowTooltip content={String(value || '')}>
                      {content}
                    </OverflowTooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <TooltipProvider>
      <div 
        className={cn(
          styles.dataTableContainer,
          className, 
          {
            'select-none': isResizing
          }
        )}
        ref={tableContainerRef}
      >
        {isMobile ? renderMobileView() : renderTableView()}
        {stickyFooter && footerContent && (
          <div className="sticky bottom-0 bg-background border-t z-10">
            {footerContent}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
