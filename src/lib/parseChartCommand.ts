// ESA Chart Command Parser — parses natural language chart editing commands
// Used by ChartCommandBar to modify chart state

export type ChartCommandAction =
  | { action: 'changeType'; chartType: 'bar' | 'line' | 'pie' | 'scatter' }
  | { action: 'highlight'; label: string }
  | { action: 'addTrendline' }
  | { action: 'filter'; label: string }
  | { action: 'compare'; labels: [string, string] }
  | { action: 'remove'; label: string }
  | { action: 'sort'; direction: 'desc' }
  | { action: 'reset' };

/**
 * Parses a natural language chart command into a structured action.
 * Returns null if the command is not recognized.
 *
 * Supported commands:
 * - "change to bar chart"       → changeType bar
 * - "change to line chart"      → changeType line
 * - "change to pie chart"       → changeType pie
 * - "change to scatter chart"   → changeType scatter
 * - "highlight [label]"         → highlight
 * - "add trendline"             → addTrendline
 * - "show only [label]"         → filter
 * - "compare [A] vs [B]"       → compare
 * - "remove [label]"            → remove
 * - "sort descending"           → sort desc
 * - "reset"                     → reset
 */
export function parseChartCommand(input: string): ChartCommandAction | null {
  const text = input.toLowerCase().trim();

  // Reset
  if (text === 'reset') {
    return { action: 'reset' };
  }

  // Change chart type
  const changeTypeMatch = text.match(/change\s+to\s+(bar|line|pie|scatter)(?:\s+chart)?/);
  if (changeTypeMatch) {
    return { action: 'changeType', chartType: changeTypeMatch[1] as 'bar' | 'line' | 'pie' | 'scatter' };
  }

  // Also support just "bar chart", "line chart", etc.
  const shortTypeMatch = text.match(/^(bar|line|pie|scatter)(?:\s+chart)?$/);
  if (shortTypeMatch) {
    return { action: 'changeType', chartType: shortTypeMatch[1] as 'bar' | 'line' | 'pie' | 'scatter' };
  }

  // Add trendline
  if (text.includes('trendline') || text.includes('trend line')) {
    return { action: 'addTrendline' };
  }

  // Sort descending
  if (text.includes('sort') && (text.includes('desc') || text.includes('descending') || text.includes('highest'))) {
    return { action: 'sort', direction: 'desc' };
  }

  // Compare A vs B
  const compareMatch = text.match(/compare\s+(.+?)\s+(?:vs|versus|and|with)\s+(.+)/);
  if (compareMatch) {
    return { action: 'compare', labels: [compareMatch[1].trim(), compareMatch[2].trim()] };
  }

  // Highlight [label]
  const highlightMatch = text.match(/highlight\s+(.+)/);
  if (highlightMatch) {
    return { action: 'highlight', label: highlightMatch[1].trim() };
  }

  // Show only [label]
  const showOnlyMatch = text.match(/show\s+only\s+(.+)/);
  if (showOnlyMatch) {
    return { action: 'filter', label: showOnlyMatch[1].trim() };
  }

  // Remove [label]
  const removeMatch = text.match(/remove\s+(.+)/);
  if (removeMatch) {
    return { action: 'remove', label: removeMatch[1].trim() };
  }

  // Not recognized
  return null;
}

/**
 * Returns a user-friendly description of a chart command for the command history.
 */
export function describeCommand(cmd: ChartCommandAction): string {
  switch (cmd.action) {
    case 'changeType': return `${cmd.chartType} chart`;
    case 'highlight': return `highlight ${cmd.label}`;
    case 'addTrendline': return 'trendline';
    case 'filter': return `show only ${cmd.label}`;
    case 'compare': return `compare ${cmd.labels[0]} vs ${cmd.labels[1]}`;
    case 'remove': return `remove ${cmd.label}`;
    case 'sort': return 'sort descending';
    case 'reset': return 'reset';
  }
}

/** The error message shown for unrecognized commands */
export const UNKNOWN_COMMAND_MESSAGE =
  "ESA doesn't support that chart edit yet. Try: change to bar chart, highlight [label], add trendline, show only [label], compare [A] vs [B], remove [label], sort descending, reset";
