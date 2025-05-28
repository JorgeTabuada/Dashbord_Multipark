import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Normalizes a header string.
 * - Converts to lowercase.
 * - Replaces spaces and special characters with underscores.
 * - Removes accents/diacritics.
 * - Ensures no leading/trailing/multiple underscores.
 * @param {string} header - The header string to normalize.
 * @returns {string} The normalized header string.
 */
const normalizeSingleHeader = (header) => {
  if (typeof header !== 'string') return '';

  // Remove accents/diacritics
  let normalized = header.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Convert to lowercase and replace spaces/special characters
  normalized = normalized
    .toLowerCase()
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w_]/g, '') // Remove non-alphanumeric characters except underscore
    .replace(/__+/g, '_') // Replace multiple underscores with single
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
  
  return normalized;
};

/**
 * Normalizes an array of header strings.
 * @param {Array<string>} headerRow - Array of header strings.
 * @returns {Array<string>} Array of normalized header strings.
 */
export const normalizeHeaders = (headerRow) => {
  if (!Array.isArray(headerRow)) return [];
  return headerRow.map(header => normalizeSingleHeader(header));
};

/**
 * Converts a value to a number.
 * Handles thousand separators (',' or '.') and decimal separators (',' or '.').
 * @param {string|number} value - The value to convert.
 * @param {string} decimalSeparatorHint - Optional hint ('.' or ',') if known.
 * @returns {number|null} The converted number or null if conversion fails.
 */
export const convertToNumber = (value, decimalSeparatorHint = '.') => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string') {
    return null;
  }

  let strValue = String(value).trim();

  // Determine actual decimal separator and thousand separator
  const hasPeriod = strValue.includes('.');
  const hasComma = strValue.includes(',');

  let decimalSeparator = decimalSeparatorHint;
  let thousandSeparator = decimalSeparatorHint === '.' ? ',' : '.';

  if (hasPeriod && hasComma) {
    // If both are present, the last one is likely the decimal separator
    if (strValue.lastIndexOf('.') > strValue.lastIndexOf(',')) {
      decimalSeparator = '.';
      thousandSeparator = ',';
    } else {
      decimalSeparator = ',';
      thousandSeparator = '.';
    }
  } else if (hasPeriod) {
    decimalSeparator = '.';
    // If only period, assume it's decimal unless it's clearly a thousand separator (e.g. "1.234")
    if (strValue.split('.').length -1 > 1 && strValue.lastIndexOf('.') < strValue.length - 3) {
        // Multiple periods or period is not near the end, likely a thousand separator
        thousandSeparator = '.';
        decimalSeparator = decimalSeparatorHint === ',' ? ',' : '$'; // Use a dummy decimal sep if it was supposed to be comma
    }

  } else if (hasComma) {
    decimalSeparator = ',';
     // If only comma, assume it's decimal unless it's clearly a thousand separator (e.g. "1,234")
     if (strValue.split(',').length -1 > 1 && strValue.lastIndexOf(',') < strValue.length - 3) {
        thousandSeparator = ',';
        decimalSeparator = decimalSeparatorHint === '.' ? '.' : '$'; // Use a dummy decimal sep if it was supposed to be period
    }
  }
  
  // Remove thousand separators
  const thousandRegex = new RegExp(`\\${thousandSeparator}`, 'g');
  strValue = strValue.replace(thousandRegex, '');

  // Replace decimal separator with '.' for parseFloat
  if (decimalSeparator !== '.') {
    strValue = strValue.replace(decimalSeparator, '.');
  }

  const num = parseFloat(strValue);
  return isNaN(num) ? null : num;
};


/**
 * Converts a value to a JavaScript Date object.
 * Handles common date string formats and Excel date serial numbers.
 * @param {string|number} value - The value to convert.
 * @returns {Date|null} The Date object or null if conversion fails.
 */
export const convertToDate = (value) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }

  if (value instanceof Date) {
    return !isNaN(value.getTime()) ? value : null;
  }

  // Handle Excel date serial numbers (numeric values)
  if (typeof value === 'number') {
    if (value > 0 && value < 60) { // Numbers before March 1, 1900, might be ambiguous due to Excel leap year bug
        // console.warn(`Excel date number ${value} is small and might be ambiguous.`);
    }
    try {
        // XLSX.SSF.parse_date_code is not directly available in the standalone 'xlsx' import for utils.
        // We need to use a different approach if it's not on XLSX.SSF or use a full build.
        // For now, let's assume it's available or we'll use a simpler check.
        // The common way is (value - 25569) * 86400 * 1000 for dates after 1900-03-01
        // or (value - 25568) * 86400 * 1000 for dates prior if handling the leap year bug.
        // A simpler way for typical modern dates:
        if (value > 25569) { // Roughly after 1970 if it were days since 1900, but Excel starts 1899-12-30 as day 0 or 1 depending on system
             const date = XLSX.SSF.parse_date_code(value); // This function is part of xlsx/types/index.d.ts but might not be exposed in all builds.
             // Check if date parts are valid
             if (date && date.y && date.m && date.d) {
                const jsDate = new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
                if (!isNaN(jsDate.getTime())) return jsDate;
             }
        }
    } catch (e) {
        // console.error("Error converting Excel date number:", e);
        // Fall through to string parsing if SSF is not available or fails
    }
  }

  if (typeof value === 'string') {
    let date = null;
    // Try "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      date = new Date(value);
      if (!isNaN(date.getTime())) return date;
    }
    // Try "DD/MM/YYYY"
    if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) {
      const parts = value.split('/');
      if (parts.length === 3) {
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        if (!isNaN(date.getTime())) return date;
      }
    }
     // Try "MM/DD/YYYY"
     if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) { // Same regex as above, but Date constructor might parse it as MM/DD
        const parts = value.split('/');
        // Check if it was DD/MM first, if that failed, try MM/DD
        date = new Date(value); // Try direct parsing
        if (!isNaN(date.getTime())) return date;
      }

    // Try ISO 8601 format (which JS Date constructor handles well)
    date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }
  
  return null;
};


/**
 * Processes an Excel file (.xlsx).
 * @param {File} file - The File object.
 * @param {object} expectedColumnsConfig - Configuration for expected columns.
 * @returns {Promise<{ data: Array<Object>, errors: Array<string> }>}
 */
export const processExcelFile = async (file, expectedColumnsConfig) => {
  const errors = [];
  const processedData = [];

  if (!file) {
    errors.push("No file provided.");
    return { data: processedData, errors };
  }

  if (!expectedColumnsConfig || Object.keys(expectedColumnsConfig).length === 0) {
    errors.push("Column configuration is missing or empty.");
    return { data: processedData, errors };
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'buffer', cellDates: true, dateNF: 'yyyy-mm-dd' }); // cellDates might help but convertToDate handles various forms
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Get raw data, keeping nulls for empty cells
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true, defval: null });

  if (jsonData.length === 0) {
    errors.push("The Excel sheet is empty.");
    return { data: processedData, errors };
  }

  const rawHeaderRow = jsonData[0];
  const normalizedFileHeaders = normalizeHeaders(rawHeaderRow);
  
  const headerMapping = {}; // Maps internal key to actual (normalized) file header
  const foundInternalKeys = new Set();

  // Validate headers and create mapping
  for (const internalKey in expectedColumnsConfig) {
    const config = expectedColumnsConfig[internalKey];
    let found = false;
    for (const originalName of config.originalNames) {
      const normalizedOriginalName = normalizeSingleHeader(originalName);
      const fileHeaderIndex = normalizedFileHeaders.indexOf(normalizedOriginalName);
      if (fileHeaderIndex !== -1) {
        headerMapping[internalKey] = { index: fileHeaderIndex, original: rawHeaderRow[fileHeaderIndex] };
        foundInternalKeys.add(internalKey);
        found = true;
        break;
      }
    }
    if (!found && config.required) {
      errors.push(`Missing required column: '${config.originalNames.join("' or '")}' (expected as '${internalKey}')`);
    }
  }

  if (errors.some(e => e.startsWith("Missing required column"))) {
    // Optionally, stop processing if required headers are missing
    // return { data: processedData, errors }; 
  }

  // Process data rows
  for (let i = 1; i < jsonData.length; i++) {
    const rowArray = jsonData[i];
    if (!rowArray || rowArray.every(cell => cell === null || String(cell).trim() === '')) {
        // Skip entirely empty or effectively empty rows
        continue;
    }
    const rowObject = {};
    let rowHasError = false;

    for (const internalKey in expectedColumnsConfig) {
      const config = expectedColumnsConfig[internalKey];
      let value = null;

      if (headerMapping[internalKey]) {
        value = rowArray[headerMapping[internalKey].index];
      } else if (config.required) {
        // This error was already caught, but good to be defensive
        // errors.push(`Row ${i + 1}: Missing data for required column '${internalKey}'.`);
        // rowHasError = true;
        // continue; // Skip this column or row
      }

      // Type conversion
      if (value === null || String(value).trim() === '') {
        rowObject[internalKey] = null;
      } else {
        switch (config.type) {
          case 'string':
            rowObject[internalKey] = String(value).trim();
            break;
          case 'number':
            const numValue = convertToNumber(value);
            if (numValue === null && config.required && value !== null && String(value).trim() !== '') { // check if it was not empty before conversion
              errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Invalid number format for value '${value}'.`);
              rowHasError = true;
            }
            rowObject[internalKey] = numValue;
            break;
          case 'date':
            const dateValue = convertToDate(value);
            if (dateValue === null && config.required && value !== null && String(value).trim() !== '') {
              errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Invalid date format for value '${value}'.`);
              rowHasError = true;
            }
            rowObject[internalKey] = dateValue;
            break;
          default:
            rowObject[internalKey] = String(value); // Default to string
        }
      }
      
      if (config.required && (rowObject[internalKey] === null || String(rowObject[internalKey]).trim() === '')) {
          // Check if the original value was also empty. If not, it means conversion might have made it empty.
          const originalValueWasEmpty = (value === null || String(value).trim() === '');
          if (!originalValueWasEmpty && rowObject[internalKey] === null) {
            // This means conversion failed and resulted in null for a required field.
            // Error already logged by type converters if format was invalid.
          } else if (originalValueWasEmpty) {
            // Actual missing required value
            errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Required value is missing.`);
            rowHasError = true;
          }
      }
    }

    if (!rowHasError) {
      processedData.push(rowObject);
    }
  }

  return { data: processedData, errors };
};


/**
 * Processes a CSV file.
 * @param {File} file - The File object.
 * @param {object} expectedColumnsConfig - Configuration for expected columns.
 * @returns {Promise<{ data: Array<Object>, errors: Array<string> }>}
 */
export const processCsvFile = (file, expectedColumnsConfig) => {
  return new Promise((resolve) => {
    const errors = [];
    const processedData = [];

    if (!file) {
      errors.push("No file provided.");
      resolve({ data: processedData, errors });
      return;
    }
    if (!expectedColumnsConfig || Object.keys(expectedColumnsConfig).length === 0) {
        errors.push("Column configuration is missing or empty.");
        resolve({ data: processedData, errors });
        return;
    }

    Papa.parse(file, {
      header: false, // We'll get arrays and handle header row manually
      skipEmptyLines: true,
      complete: (results) => {
        const allRows = results.data;
        if (allRows.length === 0) {
          errors.push("The CSV file is empty.");
          resolve({ data: processedData, errors });
          return;
        }

        const rawHeaderRow = allRows[0];
        const normalizedFileHeaders = normalizeHeaders(rawHeaderRow);
        
        const headerMapping = {}; // Maps internal key to actual (normalized) file header index
        const foundInternalKeys = new Set();

        // Validate headers and create mapping
        for (const internalKey in expectedColumnsConfig) {
          const config = expectedColumnsConfig[internalKey];
          let found = false;
          for (const originalName of config.originalNames) {
            const normalizedOriginalName = normalizeSingleHeader(originalName);
            const fileHeaderIndex = normalizedFileHeaders.indexOf(normalizedOriginalName);
            if (fileHeaderIndex !== -1) {
              headerMapping[internalKey] = { index: fileHeaderIndex, original: rawHeaderRow[fileHeaderIndex] };
              foundInternalKeys.add(internalKey);
              found = true;
              break;
            }
          }
          if (!found && config.required) {
            errors.push(`Missing required column: '${config.originalNames.join("' or '")}' (expected as '${internalKey}')`);
          }
        }
        
        if (errors.some(e => e.startsWith("Missing required column"))) {
            // Optionally, stop processing
            // resolve({ data: processedData, errors });
            // return;
        }

        // Process data rows
        for (let i = 1; i < allRows.length; i++) {
          const rowArray = allRows[i];
           if (!rowArray || rowArray.every(cell => cell === null || String(cell).trim() === '')) {
                continue; // Skip empty rows
            }
          const rowObject = {};
          let rowHasError = false;

          for (const internalKey in expectedColumnsConfig) {
            const config = expectedColumnsConfig[internalKey];
            let value = null;

            if (headerMapping[internalKey] !== undefined) {
              value = rowArray[headerMapping[internalKey].index];
            } else if (config.required) {
              // errors.push(`Row ${i + 1}: Missing data for required column '${internalKey}'.`);
              // rowHasError = true;
              // continue;
            }
            
            // Type conversion
            if (value === null || String(value).trim() === '') {
              rowObject[internalKey] = null;
            } else {
              switch (config.type) {
                case 'string':
                  rowObject[internalKey] = String(value).trim();
                  break;
                case 'number':
                  const numValue = convertToNumber(value);
                  if (numValue === null && config.required && value !== null && String(value).trim() !== '') {
                     errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Invalid number format for value '${value}'.`);
                     rowHasError = true;
                  }
                  rowObject[internalKey] = numValue;
                  break;
                case 'date':
                  const dateValue = convertToDate(value);
                  if (dateValue === null && config.required && value !== null && String(value).trim() !== '') {
                    errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Invalid date format for value '${value}'.`);
                    rowHasError = true;
                  }
                  rowObject[internalKey] = dateValue;
                  break;
                default:
                  rowObject[internalKey] = String(value);
              }
            }
            if (config.required && (rowObject[internalKey] === null || String(rowObject[internalKey]).trim() === '')) {
                const originalValueWasEmpty = (value === null || String(value).trim() === '');
                 if (!originalValueWasEmpty && rowObject[internalKey] === null) {
                    // Error logged by type converters
                 } else if (originalValueWasEmpty){
                    errors.push(`Row ${i + 1}, Column '${headerMapping[internalKey]?.original || internalKey}': Required value is missing.`);
                    rowHasError = true;
                 }
            }
          }

          if (!rowHasError) {
            processedData.push(rowObject);
          }
        }
        resolve({ data: processedData, errors });
      },
      error: (error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ data: processedData, errors });
      }
    });
  });
};

// Example configurations (can be moved to a config file or constants later)
export const odooTransacoesConfig = {
  imma: { type: 'string', required: true, originalNames: ['imma', 'matrícula', 'matricula', 'License Plate'] },
  parking_name: { type: 'string', required: true, originalNames: ['parking_name', 'parque', 'Parking'] },
  preco: { type: 'number', required: true, originalNames: ['preço', 'preco', 'preço calculado', 'Price'] }, // Preço calculado
  price_to_pay: { type: 'number', required: false, originalNames: ['price_to_pay', 'preço_a_pagar', 'preço pago', 'Amount Paid'] }, // Preço pago
  estado: { type: 'string', required: false, originalNames: ['estado', 'state'] }
};

export const backofficeReservasConfig = {
  license_plate: { type: 'string', required: true, originalNames: ['license_plate', 'matrícula', 'matricula'] },
  parque_id: { type: 'string', required: true, originalNames: ['parque_id', 'ID do parque', 'Park ID', 'parque'] }, // Needs mapping if file has park name
  booking_price: { type: 'number', required: true, originalNames: ['booking_price', 'preço da tabela', 'Tariff Price'] },
  campaign_id_aplicada: { type: 'string', required: false, originalNames: ['campaign_id_aplicada', 'campanha', 'Campaign'] },
  estado_reserva_atual: { type: 'string', required: false, originalNames: ['estado_reserva_atual', 'ação', 'Action', 'Status'] }
};

export const caixaTransacoesConfig = {
  licenca_placa: { type: 'string', required: true, originalNames: ['licenca_placa', 'matrícula', 'matricula', 'License Plate'] },
  condutor_entrega_id: { type: 'string', required: true, originalNames: ['condutor_entrega_id', 'ID do condutor da entrega', 'Driver ID'] },
  criado_at_db: { type: 'date', required: true, originalNames: ['criado_at_db', 'timestamp da operação', 'Timestamp', 'Date', 'Data'] },
  parque_id: { type: 'string', required: true, originalNames: ['parque_id', 'ID do parque da caixa', 'Park ID', 'parque'] },
  preco_corrigido: { type: 'number', required: true, originalNames: ['preco_corrigido', 'preço cobrado na caixa', 'Amount Charged'] },
  pagamento_metodo: { type: 'string', required: true, originalNames: ['pagamento_metodo', 'método de pagamento na caixa', 'Payment Method'] },
  campanha_id_aplicada: { type: 'string', required: false, originalNames: ['campanha_id_aplicada', 'campanha', 'Campaign'] }
};
