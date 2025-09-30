// Location entity for precise location information of findings
// Healthcare compliance focused for Brazilian aesthetic clinics

export interface Location {
  filePath: string;
  lineNumber?: number;
  columnNumber?: number;
  packageName?: string;
  component?: string;
  
  // Enhanced location data
  functionName?: string;
  className?: string;
  variableName?: string;
  
  // Code context
  codeSnippet?: string;
  surroundingCode?: {
    before: string;
    after: string;
  };
  
  // Healthcare context
  healthcareContext?: {
    patientDataInvolved: boolean;
    clinicalFunction: boolean;
    validationFunction: boolean;
    businessFunction: boolean;
  };
  
  // Version control
  gitInfo?: {
    branch: string;
    commit: string;
    author: string;
    date: Date;
  };
}

// Type guards
export function isLocation(obj: any): obj is Location {
  return obj &&
    typeof obj.filePath === 'string' &&
    (obj.lineNumber === undefined || typeof obj.lineNumber === 'number') &&
    (obj.columnNumber === undefined || typeof obj.columnNumber === 'number') &&
    (obj.packageName === undefined || typeof obj.packageName === 'string') &&
    (obj.component === undefined || typeof obj.component === 'string');
}

// Location formatting
export function formatLocation(location: Location): string {
  let formatted = location.filePath;
  
  if (location.lineNumber) {
    formatted += `:${location.lineNumber}`;
    if (location.columnNumber) {
      formatted += `:${location.columnNumber}`;
    }
  }
  
  if (location.packageName) {
    formatted += ` (${location.packageName})`;
  }
  
  if (location.component) {
    formatted += ` [${location.component}]`;
  }
  
  return formatted;
}

// Location comparison
export function compareLocations(a: Location, b: Location): number {
  // Compare by file path first
  const pathComparison = a.filePath.localeCompare(b.filePath);
  if (pathComparison !== 0) return pathComparison;
  
  // Then by line number
  if (a.lineNumber !== undefined && b.lineNumber !== undefined) {
    return a.lineNumber - b.lineNumber;
  }
  
  // Then by column number
  if (a.columnNumber !== undefined && b.columnNumber !== undefined) {
    return a.columnNumber - b.columnNumber;
  }
  
  return 0;
}

// Location distance calculation
export function calculateLocationDistance(a: Location, b: Location): number {
  if (a.filePath !== b.filePath) {
    return Infinity; // Different files
  }
  
  const lineDiff = Math.abs((a.lineNumber || 0) - (b.lineNumber || 0));
  const columnDiff = Math.abs((a.columnNumber || 0) - (b.columnNumber || 0));
  
  return lineDiff * 100 + columnDiff; // Weight lines more heavily
}

// Location clustering
export function clusterLocations(locations: Location[]): Location[][] {
  if (locations.length === 0) return [];
  
  const sortedLocations = [...locations].sort(compareLocations);
  const clusters: Location[][] = [];
  let currentCluster: Location[] = [sortedLocations[0]];
  
  for (let i = 1; i < sortedLocations.length; i++) {
    const current = sortedLocations[i];
    const lastInCluster = currentCluster[currentCluster.length - 1];
    
    const distance = calculateLocationDistance(lastInCluster, current);
    
    // If distance is small, add to current cluster
    if (distance < 1000) { // Within ~10 lines
      currentCluster.push(current);
    } else {
      // Start new cluster
      clusters.push(currentCluster);
      currentCluster = [current];
    }
  }
  
  clusters.push(currentCluster);
  return clusters;
}

// Healthcare location analysis
export function analyzeLocationHealthcareContext(location: Location): Location['healthcareContext'] {
  const filePath = location.filePath.toLowerCase();
  const functionName = location.functionName?.toLowerCase() || '';
  const className = location.className?.toLowerCase() || '';
  
  const patientDataPatterns = [
    'patient', 'paciente', 'medical', 'medico', 'clinical', 'clinico',
    'treatment', 'tratamento', 'diagnosis', 'diagnostico', 'prescription', 'receita',
    'appointment', 'consulta', 'schedule', 'agendamento'
  ];
  
  const clinicalPatterns = [
    'validate', 'check', 'calculate', 'assess', 'verify', 'diagnose',
    'prescribe', 'treatment', 'therapy', 'procedure', 'surgery'
  ];
  
  const validationPatterns = [
    'validate', 'check', 'verify', 'ensure', 'confirm', 'require',
    'mandatory', 'auth', 'authorize', 'permission'
  ];
  
  const businessPatterns = [
    'billing', 'payment', 'invoice', 'schedule', 'cancel', 'reschedule',
    'price', 'cost', 'revenue', 'financial', 'admin'
  ];
  
  const allText = filePath + ' ' + functionName + ' ' + className;
  const lowerAllText = allText.toLowerCase();
  
  return {
    patientDataInvolved: patientDataPatterns.some(pattern => lowerAllText.includes(pattern)),
    clinicalFunction: clinicalPatterns.some(pattern => lowerAllText.includes(pattern)),
    validationFunction: validationPatterns.some(pattern => lowerAllText.includes(pattern)),
    businessFunction: businessPatterns.some(pattern => lowerAllText.includes(pattern)),
  };
}

// Location severity assessment
export function assessLocationSeverity(location: Location): 'low' | 'medium' | 'high' | 'critical' {
  const context = location.healthcareContext || analyzeLocationHealthcareContext(location);
  
  // Critical if patient data is involved and it's a clinical function
  if (context.patientDataInvolved && context.clinicalFunction) {
    return 'critical';
  }
  
  // High if patient data is involved
  if (context.patientDataInvolved) {
    return 'high';
  }
  
  // High if clinical function without patient data (might still affect patient safety)
  if (context.clinicalFunction) {
    return 'high';
  }
  
  // Medium if validation function (might affect compliance)
  if (context.validationFunction) {
    return 'medium';
  }
  
  // Low for business functions
  if (context.businessFunction) {
    return 'low';
  }
  
  return 'low';
}