/**
 * Grid/Table Models
 * Configuration interfaces for dynamic grid/table fields.
 */

/**
 * Column definition for grid/table fields.
 * Each column represents a cell type in the dynamic table.
 */
export interface GridColumn {
  columnId: string;                   // Unique identifier for the column
  label: string;                      // Column header text
  type: 'text' | 'number' | 'date';  // Input type for cells in this column
  required?: boolean;                 // Whether this column is required
}
