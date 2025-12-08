// Color schemes for charts
const colorScheme = {
    primary: ['#667eea', '#764ba2', '#34d399', '#f59e0b', '#ef4444', '#3b82f6'],
    status: {
        'Active': '#10b981',
        'Inactive': '#f59e0b',
        'Lapsed': '#ef4444',
        'Lost': '#6b7280',
        'Unknown': '#9ca3af'
    }
};

// Common layout settings for all charts
const commonLayout = {
    margin: { t: 20, r: 20, b: 40, l: 40 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
        family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        size: 12,
        color: '#374151'
    }
};

// Configuration for charts
const chartConfig = {
    responsive: true,
    displayModeBar: false
};

// Fetch and render Status Pie Chart
async function renderStatusPieChart() {
    try {
        const response = await fetch('/api/status-distribution');
        const data = await response.json();
        
        const colors = data.labels.map(label => colorScheme.status[label] || '#9ca3af');
        
        const trace = {
            labels: data.labels,
            values: data.values,
            type: 'pie',
            hole: 0.4,
            marker: {
                colors: colors,
                line: {
                    color: 'white',
                    width: 2
                }
            },
            textposition: 'inside',
            textinfo: 'label+percent',
            hoverinfo: 'label+value+percent',
            hovertemplate: '<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
        };
        
        const layout = {
            ...commonLayout,
            showlegend: true,
            legend: {
                orientation: 'h',
                yanchor: 'bottom',
                y: -0.2,
                xanchor: 'center',
                x: 0.5
            }
        };
        
        Plotly.newPlot('statusPieChart', [trace], layout, chartConfig);
    } catch (error) {
        console.error('Error rendering status pie chart:', error);
    }
}

// Fetch and render Recent Status Bar Chart
async function renderRecentStatusBarChart() {
    try {
        const response = await fetch('/api/recent-status-distribution');
        const data = await response.json();
        
        const trace = {
            x: data.labels,
            y: data.values,
            type: 'bar',
            marker: {
                color: colorScheme.primary,
                line: {
                    color: 'white',
                    width: 1
                }
            },
            //text: data.values,
            textposition: 'outside',
            hovertemplate: '<b>%{x}</b><br>Count: %{y}<extra></extra>'
        };
        
        const layout = {
            ...commonLayout,
            xaxis: {
                tickangle: -45,
                automargin: true
            },
            yaxis: {
                title: 'Number of Patients',
                gridcolor: '#e5e7eb'
            }
        };
        
        Plotly.newPlot('recentStatusBarChart', [trace], layout, chartConfig);
    } catch (error) {
        console.error('Error rendering recent status bar chart:', error);
    }
}

// Fetch and render Store Distribution Bar Chart
async function renderStoreBarChart() {
    try {
        const response = await fetch('/api/store-distribution');
        const data = await response.json();
        
        const trace = {
            x: data.labels,
            y: data.values,
            type: 'bar',
            marker: {
                color: '#667eea',
                line: {
                    color: 'white',
                    width: 1
                }
            },
            //text: data.values,
            textposition: 'outside',
            hovertemplate: '<b>%{x}</b><br>Patient Count: %{y}<extra></extra>'
        };
        
        const layout = {
            ...commonLayout,
            xaxis: {
                title: 'Store Number',
                tickangle: -45,
                automargin: true
            },
            yaxis: {
                title: 'Number of Visits',
                gridcolor: '#e5e7eb'
            }
        };
        
        Plotly.newPlot('storeBarChart', [trace], layout, chartConfig);
    } catch (error) {
        console.error('Error rendering store bar chart:', error);
    }
}

// Fetch and render Transition Timeline
async function renderTransitionTimeline() {
    try {
        const response = await fetch('/api/transition-timeline');
        const data = await response.json();
        
        if (data.labels.length === 0) {
            // Display message if no data
            document.getElementById('transitionTimeline').innerHTML = 
                '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">No transition data available</div>';
            return;
        }
        
        // Build custom hover text with transition details
        const hoverText = data.details.map(periodData => {
            let hoverInfo = `<b>${periodData.period}</b><br>`;
            hoverInfo += `Total Transitions: ${periodData.count}<br><br>`;
            
            // Group transitions by status change
            const statusGroups = {};
            periodData.transitions.forEach(t => {
                const key = `${t.recent_status}`;
                if (!statusGroups[key]) {
                    statusGroups[key] = [];
                }
                statusGroups[key].push(t);
            });
            
            // Add grouped transitions to hover text (limit to first 10)
            let count = 0;
            for (const [status, transitions] of Object.entries(statusGroups)) {
                if (count >= 10) {
                    hoverInfo += `<br>... and ${periodData.count - count} more`;
                    break;
                }
                hoverInfo += `<b>${status}</b>: ${transitions.length} patient(s)<br>`;
                
                // Show first 3 patients for this status
                transitions.slice(0, 3).forEach(t => {
                    hoverInfo += `  • Patient ${t.patient_id} (${t.status})<br>`;
                    count++;
                });
                
                if (transitions.length > 3) {
                    hoverInfo += `  ... and ${transitions.length - 3} more<br>`;
                }
            }
            
            return hoverInfo;
        });
        
        const trace = {
            x: data.labels,
            y: data.values,
            type: 'scatter',
            mode: 'lines+markers',
            line: {
                color: '#764ba2',
                width: 3,
                shape: 'spline'
            },
            marker: {
                size: 8,
                color: '#667eea',
                line: {
                    color: 'white',
                    width: 2
                }
            },
            fill: 'tozeroy',
            fillcolor: 'rgba(102, 126, 234, 0.2)',
            text: hoverText,
            hovertemplate: '%{text}<extra></extra>',
            hoverlabel: {
                align: 'left',
                bgcolor: 'white',
                bordercolor: '#667eea',
                font: {
                    size: 11,
                    family: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
                }
            }
        };
        
        const layout = {
            ...commonLayout,
            xaxis: {
                title: 'Time Period',
                tickangle: -45,
                automargin: true,
                gridcolor: '#e5e7eb'
            },
            yaxis: {
                title: 'Number of Transitions',
                gridcolor: '#e5e7eb'
            }
        };
        
        Plotly.newPlot('transitionTimeline', [trace], layout, chartConfig);
    } catch (error) {
        console.error('Error rendering transition timeline:', error);
    }
}

// Initialize all charts when the page loads
document.addEventListener('DOMContentLoaded', function() {
    renderStatusPieChart();
    renderRecentStatusBarChart();
    renderStoreBarChart();
    renderTransitionTimeline();
    
    // Refresh charts every 30 seconds (optional - remove if not needed)
    setInterval(() => {
        renderStatusPieChart();
        renderRecentStatusBarChart();
        renderStoreBarChart();
        renderTransitionTimeline();
    }, 30000);
});

// Handle window resize to make charts responsive
window.addEventListener('resize', function() {
    Plotly.Plots.resize('statusPieChart');
    Plotly.Plots.resize('recentStatusBarChart');
    Plotly.Plots.resize('storeBarChart');
    Plotly.Plots.resize('transitionTimeline');
});
