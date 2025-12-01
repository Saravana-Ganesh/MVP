# Grid Validation Rules - QC Sampling Configuration

## Overview
This document explains the validation rules for grid row configuration in the Form Generator Engine. These rules ensure that the QC sampling configuration is business-wise consistent and prevents invalid configurations.

## Configuration Parameters

### Core Parameters
- **`minRows`**: Minimum number of samples the operator **must** enter before submission
- **`maxRows`**: Maximum number of samples the operator is **allowed** to enter
- **`initialRows`**: Number of rows displayed when the grid first opens (starting rows)
- **`allowAddRow`**: Boolean flag to enable/disable the "+ Add Row" button

## Validation Rules

### Rule 1: Range Consistency
```
minRows ≤ initialRows ≤ maxRows
```
- Initial rows must be between minimum and maximum
- Ensures the grid starts in a valid state
- **Error**: "Initial rows cannot be less than minimum rows" or "Initial rows cannot be greater than maximum rows"

### Rule 2: Min-Max Relationship
```
minRows ≤ maxRows
```
- Minimum cannot exceed maximum
- Basic range validation
- **Error**: "Minimum rows cannot be greater than maximum rows"

### Rule 3: Fixed Number Consistency
```
If allowAddRow = false, then minRows = maxRows
```
- When add/remove is disabled, min and max must be equal (fixed number of samples)
- Prevents configuration where operator cannot add rows but min ≠ max
- **Error**: "When 'Add Row' is disabled, minimum and maximum rows must be equal (fixed number of samples)"

### Rule 4: Positive Values
```
minRows ≥ 1, maxRows ≥ 1, initialRows ≥ 1
```
- All row counts must be positive integers
- At least 1 row is always required
- **Error**: Field-level validation on each input

## Business Use Cases

### Case 1: Exactly Fixed Number of Samples
**Business Requirement**: "We always need exactly 5 readings. Not more, not less."

**Configuration**:
```json
{
  "minRows": 5,
  "maxRows": 5,
  "initialRows": 5,
  "allowAddRow": false
}
```

**Behavior**:
- Grid shows exactly 5 rows on opening
- No "+ Add Row" button (disabled)
- No delete row button
- Operator must fill exactly 5 rows before submission
- **Pattern**: ✅ Case 1: Fixed 5 samples (no flexibility)

---

### Case 2: Minimum Required, Can Add More
**Business Requirement**: "Enter at least 3 readings, you may add more if needed, but don't go more than 10."

**Configuration**:
```json
{
  "minRows": 3,
  "maxRows": 10,
  "initialRows": 3,
  "allowAddRow": true
}
```

**Behavior**:
- Grid shows 3 rows initially
- "+ Add Row" button visible (can add up to 10 total)
- Operator must fill at least 3 rows to submit
- Can add rows until reaching 10 maximum
- **Pattern**: ✅ Case 2: Minimum 3 samples, can add up to 10

---

### Case 3: Start with Multiple Rows, Only Minimum Mandatory
**Business Requirement**: "Show 5 rows initially so it looks like Excel, but only 1 row is mandatory. Max 10 rows."

**Configuration**:
```json
{
  "minRows": 1,
  "maxRows": 10,
  "initialRows": 5,
  "allowAddRow": true
}
```

**Behavior**:
- Grid shows 5 empty rows on opening (Excel-like feel)
- "+ Add Row" button visible
- Operator only needs to fill 1 row minimum to submit
- Can add/remove rows between 1 and 10
- **Pattern**: ✅ Case 3: Start with 5 rows, only 1 mandatory, max 10

---

### Case 4: Dynamic Based on Lot Size (Advanced)
**Business Requirement**: "Take 1% of lot size, minimum 3, maximum 20."

**Configuration** (for lot size 1000):
```json
{
  "minRows": 3,
  "maxRows": 20,
  "initialRows": 10,  // Calculated: 1% of 1000 = 10
  "allowAddRow": true
}
```

**Note**: `initialRows` is calculated by backend based on lot size, but the grid still validates using the same rules.

## Validation Flow

### Real-Time Validation
1. User changes any row configuration value (minRows, maxRows, initialRows, allowAddRow)
2. Form validator runs automatically via `valueChanges` subscription
3. Validation errors are computed and displayed immediately
4. Configuration pattern is identified and shown
5. Save button is disabled if form is invalid

### Validation Display
- **Configuration Pattern**: Shows which business case is being used (Green border)
- **Validation Errors**: Shows all validation errors in a yellow warning box
- **Save Button**: Disabled when form is invalid (visual feedback)

## Implementation Details

### Validator Function
Located in: `grid-column-config-dialog.component.ts`

```typescript
private gridRowValidator(control: AbstractControl): ValidationErrors | null {
  // Validates minRows, maxRows, initialRows, allowAddRow
  // Returns validation errors or null if valid
}
```

### Helper Methods

1. **`getValidationErrors()`**: Returns user-friendly error messages
2. **`getConfigurationPattern()`**: Identifies which business case pattern is active
3. **`setupValidationListeners()`**: Sets up real-time validation on value changes

## Testing Scenarios

### Valid Configurations
✅ minRows=5, maxRows=5, initialRows=5, allowAddRow=false (Fixed)
✅ minRows=3, maxRows=10, initialRows=3, allowAddRow=true (Min with flex)
✅ minRows=1, maxRows=10, initialRows=5, allowAddRow=true (Excel-like)
✅ minRows=2, maxRows=8, initialRows=4, allowAddRow=true (Custom)

### Invalid Configurations
❌ minRows=5, maxRows=3, initialRows=4 (min > max)
❌ minRows=5, maxRows=10, initialRows=3 (initial < min)
❌ minRows=3, maxRows=8, initialRows=12 (initial > max)
❌ minRows=3, maxRows=10, allowAddRow=false (fixed mode but min ≠ max)

## Future Enhancements

1. **Lot Size Integration**: Automatically calculate `initialRows` based on lot size
2. **Preset Templates**: Quick-select buttons for common patterns (Fixed 5, Min 3 Max 10, etc.)
3. **Visual Preview**: Show a mock grid preview based on configuration
4. **Batch Configuration**: Apply same row rules to multiple grid fields at once

## Questions to Ask Business

When configuring a new test/form with a grid field:

1. **How many readings are minimum?** → `minRows`
2. **What is the maximum you want to allow?** → `maxRows`
3. **How many rows should we show when operator opens screen?** → `initialRows`
   - Usually = minRows, or a nice number like 5 for Excel-like feel
4. **Should operator be allowed to add/remove rows?**
   - If NO → `allowAddRow = false`, `minRows = maxRows`
   - If YES → `allowAddRow = true`

## Support

For questions or issues with grid validation:
- Check this documentation first
- Review the implementation in `grid-column-config-dialog.component.ts`
- Test your configuration against the validation scenarios above
