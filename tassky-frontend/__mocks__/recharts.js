// Mock for recharts components
export const BarChart = ({ children }) => (
  <div data-testid="mock-bar-chart">{children}</div>
);
export const Bar = () => <div data-testid="mock-bar"></div>;
export const XAxis = () => <div data-testid="mock-xaxis"></div>;
export const YAxis = () => <div data-testid="mock-yaxis"></div>;
export const CartesianGrid = () => <div data-testid="mock-grid"></div>;
export const Tooltip = () => <div data-testid="mock-tooltip"></div>;
export const Legend = () => <div data-testid="mock-legend"></div>;
export const ResponsiveContainer = ({ children }) => (
  <div data-testid="mock-responsive-container">{children}</div>
);
export const LineChart = ({ children }) => (
  <div data-testid="mock-line-chart">{children}</div>
);
export const Line = () => <div data-testid="mock-line"></div>;
