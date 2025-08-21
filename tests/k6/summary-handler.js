import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    // HTML Report - Reporte visual interactivo
    [`performance-report-${timestamp}.html`]: htmlReport(data, {
      title: 'K6 Performance Test Report',
      logo: 'https://k6.io/docs/assets/images/k6-logo.svg'
    }),
    
    // JSON Summary - Datos estructurados para CI/CD
    [`performance-summary-${timestamp}.json`]: JSON.stringify(data, null, 2),
    
    // JUnit XML - Compatible con herramientas de CI
    [`performance-junit-${timestamp}.xml`]: generateJUnitXML(data),
    
    // Console output con colores
    stdout: textSummary(data, { 
      indent: '  ', 
      enableColors: true,
      summaryTimeUnit: 'ms'
    }),
  };
}

function generateJUnitXML(data) {
  const timestamp = new Date().toISOString();
  let totalTests = 0;
  let totalFailures = 0;
  let totalTime = data.state?.testRunDurationMs || 0;
  
  // Procesar métricas para crear test cases
  const testCases = [];
  
  // Procesar checks
  if (data.metrics?.checks) {
    const checksMetric = data.metrics.checks;
    const checksPassed = checksMetric.values?.passes || 0;
    const checksTotal = checksMetric.values?.passes + checksMetric.values?.fails || 0;
    
    testCases.push({
      name: 'Performance Checks',
      className: 'k6.checks',
      time: (totalTime / 1000).toFixed(3),
      failure: checksTotal > 0 && (checksPassed / checksTotal) < 0.99
    });
    totalTests++;
    if (testCases[testCases.length - 1].failure) totalFailures++;
  }
  
  // Procesar thresholds
  if (data.metrics) {
    Object.keys(data.metrics).forEach(metricName => {
      const metric = data.metrics[metricName];
      if (metric.thresholds) {
        Object.keys(metric.thresholds).forEach(thresholdName => {
          const threshold = metric.thresholds[thresholdName];
          testCases.push({
            name: `${metricName} - ${thresholdName}`,
            className: 'k6.thresholds',
            time: (totalTime / 1000).toFixed(3),
            failure: !threshold.ok,
            errorMessage: threshold.ok ? null : `Threshold failed: ${thresholdName}`
          });
          totalTests++;
          if (!threshold.ok) totalFailures++;
        });
      }
    });
  }
  
  // Procesar errores HTTP
  if (data.metrics?.http_req_failed) {
    const httpErrors = data.metrics.http_req_failed;
    const errorRate = httpErrors.values?.rate || 0;
    testCases.push({
      name: 'HTTP Request Success Rate',
      className: 'k6.http',
      time: (totalTime / 1000).toFixed(3),
      failure: errorRate > 0.01, // > 1% error rate
      errorMessage: errorRate > 0.01 ? `HTTP error rate too high: ${(errorRate * 100).toFixed(2)}%` : null
    });
    totalTests++;
    if (errorRate > 0.01) totalFailures++;
  }

  // Generar XML
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += `<testsuites name="k6-performance-tests" tests="${totalTests}" failures="${totalFailures}" time="${(totalTime / 1000).toFixed(3)}" timestamp="${timestamp}">\n`;
  xml += `  <testsuite name="Performance Tests" tests="${totalTests}" failures="${totalFailures}" time="${(totalTime / 1000).toFixed(3)}">\n`;
  
  testCases.forEach(test => {
    xml += `    <testcase name="${escapeXml(test.name)}" classname="${test.className}" time="${test.time}">\n`;
    if (test.failure && test.errorMessage) {
      xml += `      <failure message="${escapeXml(test.errorMessage)}" type="ThresholdFailure">\n`;
      xml += `        ${escapeXml(test.errorMessage)}\n`;
      xml += '      </failure>\n';
    }
    xml += '    </testcase>\n';
  });
  
  xml += '  </testsuite>\n';
  xml += '</testsuites>';
  
  return xml;
}

function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
