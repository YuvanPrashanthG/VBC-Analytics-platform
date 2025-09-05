// Initialize the charts object to store chart instances
let charts = {};

document.addEventListener('DOMContentLoaded', function() {
  if (typeof acoData !== 'undefined') {
    createEnhancedSpendingChart(acoData);
    createEnhancedQualityGauge(acoData);
    createBeneficiaryChart(acoData);
    createExpenditureBreakdownChart(acoData);
    createProviderChart(acoData);
  }
});

// Defines the color schemes for the charts
const colorPalettes = {
  spending: { benchmark: '#4A90E2', actual: '#2ED573', actualOver: '#FF4757' },
  quality: { excellent: '#2ED573', good: '#FFA502', needs_improvement: '#FF4757', poor: '#b33939' }
};

// Spending Line Chart
function createEnhancedSpendingChart(aco) {
  const ctx = document.getElementById('spendingChart').getContext('2d');
  if (charts.spending) {
    charts.spending.destroy();
  }
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const benchmarkData = Array(12).fill(aco.benchmarkSpending / 12).map((val, i) => val * (1 + Math.sin(i * 0.5) * 0.1));
  const actualData = Array(12).fill(aco.totalSpending / 12).map((val, i) => val * (1 + Math.sin(i * 0.7) * 0.15));
  
  const benchmarkGradient = ctx.createLinearGradient(0, 0, 0, 300);
  benchmarkGradient.addColorStop(0, 'rgba(74, 144, 226, 0.6)');
  benchmarkGradient.addColorStop(1, 'rgba(74, 144, 226, 0.1)');
  
  const actualGradient = ctx.createLinearGradient(0, 0, 0, 300);
  if (aco.totalSpending > aco.benchmarkSpending) {
    actualGradient.addColorStop(0, 'rgba(255, 71, 87, 0.6)');
    actualGradient.addColorStop(1, 'rgba(255, 71, 87, 0.1)');
  } else {
    actualGradient.addColorStop(0, 'rgba(46, 213, 115, 0.6)');
    actualGradient.addColorStop(1, 'rgba(46, 213, 115, 0.1)');
  }
  
  charts.spending = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Benchmark',
          data: benchmarkData,
          borderColor: colorPalettes.spending.benchmark,
          backgroundColor: benchmarkGradient,
          fill: true,
          tension: 0.4
        }, 
        {
          label: 'Actual',
          data: actualData,
          borderColor: aco.totalSpending > aco.benchmarkSpending ? colorPalettes.spending.actualOver : colorPalettes.spending.actual,
          backgroundColor: actualGradient,
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: { 
          y: { ticks: { color: 'var(--medium-gray)' }, grid: { color: 'rgba(255,255,255,0.2)' } }, 
          x: { ticks: { color: 'var(--medium-gray)' }, grid: { color: 'rgba(255,255,255,0.1)' } } 
      },
      plugins: { legend: { labels: { color: 'var(--medium-gray)' } } }
    }
  });
}

// Quality Gauge Chart
function createEnhancedQualityGauge(aco) {
  const ctx = document.getElementById('qualityGauge').getContext('2d');
  if (charts.quality) {
    charts.quality.destroy();
  }
  let qualityColor;
  if (aco.qualityScore >= 90) { qualityColor = colorPalettes.quality.excellent; } 
  else if (aco.qualityScore >= 80) { qualityColor = colorPalettes.quality.good; }
  else if (aco.qualityScore >= 70) { qualityColor = colorPalettes.quality.needs_improvement; }
  else { qualityColor = colorPalettes.quality.poor; }

  charts.quality = new Chart(ctx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [aco.qualityScore, 100 - aco.qualityScore],
        backgroundColor: [qualityColor, '#e8eaed'],
        borderWidth: 0,
        cutout: '75%'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      animation: { animateRotate: true, duration: 2000 }
    },
    plugins: [{
      beforeDraw: function(chart) {
        const { ctx, chartArea: { left, right, top, bottom }, } = chart;
        ctx.save();
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 32px Montserrat';
        ctx.fillStyle = qualityColor;
        ctx.fillText(aco.qualityScore + '%', centerX, centerY);
        ctx.restore();
      }
    }]
  });
}

// Beneficiary Breakdown Doughnut Chart
function createBeneficiaryChart(aco) {
    if (charts.beneficiary) {
        charts.beneficiary.destroy();
    }
    const ctx = document.getElementById('beneficiaryChart').getContext('2d');
    charts.beneficiary = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Aged/Non-Dual', 'Aged/Dual', 'Disabled', 'ESRD'],
            datasets: [{
                data: [
                    aco.beneficiaryCounts.agedNonDual,
                    aco.beneficiaryCounts.agedDual,
                    aco.beneficiaryCounts.disabled,
                    aco.beneficiaryCounts.esrd
                ],
                backgroundColor: ['#4A90E2', '#B3D9FF', '#6C757D', '#FF4757'],
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: context => `${context.label}: ${new Intl.NumberFormat('en-US').format(context.parsed)}`
                    }
                }
            }
        }
    });
}

// Per Capita Expenditure Bar Chart
function createExpenditureBreakdownChart(aco) {
    if (charts.expenditureBreakdown) {
        charts.expenditureBreakdown.destroy();
    }
    const ctx = document.getElementById('expenditureBreakdownChart').getContext('2d');
    charts.expenditureBreakdown = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Aged/Non-Dual', 'Aged/Dual', 'Disabled', 'ESRD'],
            datasets: [{
                label: 'Per Capita Expenditure ($)',
                data: [
                    aco.perCapitaExpenditureBreakdown.agedNonDual,
                    aco.perCapitaExpenditureBreakdown.agedDual,
                    aco.perCapitaExpenditureBreakdown.disabled,
                    aco.perCapitaExpenditureBreakdown.esrd
                ],
                backgroundColor: ['#B3D9FF', '#85B7E8', '#4A90E2', '#2A5CAA'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // Makes it a horizontal bar chart
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => '$' + new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)
                    }
                }
            }
        }
    });
}

// == MODIFIED PROVIDER CHART ==
// Provider Count Horizontal Bar Chart
function createProviderChart(aco) {
    if (charts.provider) {
        charts.provider.destroy();
    }
    const ctx = document.getElementById('providerChart').getContext('2d');
    
    const providerLabels = Object.keys(aco.providerCounts);
    const providerData = Object.values(aco.providerCounts);
    
    charts.provider = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: providerLabels,
            datasets: [{
                label: 'Provider Count',
                data: providerData,
                backgroundColor: '#4A90E2',
                borderColor: '#2A5CAA',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // This is the line that makes the chart horizontal
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: { // 'x' scale is now the value axis
                    beginAtZero: true
                }
            }
        }
    });
}