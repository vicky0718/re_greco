from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

# Path to the output table
DATA_PATH = os.path.join('..', 'data', 'processed', 'dim_patient_status.xlsx')

def load_data():
    """Load and process the output table data"""
    df = pd.read_excel(DATA_PATH)
    return df

def calculate_kpis(df):
    """Calculate KPI metrics based on latest patient status"""
    # Get the latest record for each patient (sorted by effective date)
    df_copy = df.copy()
    df_copy['eff_dt'] = pd.to_datetime(df_copy['eff_dt'], errors='coerce')
    
    # Get the latest record for each patient
    latest_records = df_copy.sort_values('eff_dt').groupby('entrp_ptnt_id').tail(1)
    
    kpis = {
        'total_patients': int(latest_records['entrp_ptnt_id'].nunique()),
        'currently_active': int(latest_records[latest_records['status'] == 'Active'].shape[0]),
        'newly_engaged': int(latest_records[latest_records['recent_status'] == 'Recently New'].shape[0]),
        'reactivated_patients': int(latest_records[latest_records['recent_status'] == 'Recently Reactivated'].shape[0])
    }
    return kpis

def get_status_distribution(df):
    """Get status distribution for pie chart"""
    status_counts = df['status'].value_counts().to_dict()
    return {
        'labels': list(status_counts.keys()),
        'values': list(status_counts.values())
    }

def get_recent_status_distribution(df):
    """Get recent status distribution for bar chart"""
    recent_status_counts = df['recent_status'].value_counts().to_dict()
    return {
        'labels': list(recent_status_counts.keys()),
        'values': list(recent_status_counts.values())
    }

def get_store_distribution(df):
    """Get store distribution for top stores"""
    store_counts = df['prev_store_nbr'].value_counts().head(10).to_dict()
    return {
        'labels': [f"Store {int(k)}" if pd.notna(k) else "Unknown" for k in store_counts.keys()],
        'values': list(store_counts.values())
    }

def get_transition_timeline(df):
    """Get transition date distribution"""
    df_copy = df.copy()
    df_copy['transition_dt'] = pd.to_datetime(df_copy['transition_dt'], errors='coerce')
    df_filtered = df_copy[df_copy['transition_dt'].notna()]
    
    if df_filtered.empty:
        return {'labels': [], 'values': []}
    
    df_filtered['year_month'] = df_filtered['transition_dt'].dt.to_period('M').astype(str)
    timeline_counts = df_filtered['year_month'].value_counts().sort_index().to_dict()
    
    return {
        'labels': list(timeline_counts.keys()),
        'values': list(timeline_counts.values())
    }

@app.route('/')
def dashboard():
    """Render the main dashboard page"""
    try:
        df = load_data()
        kpis = calculate_kpis(df)
        # Convert dataframe to list of dictionaries for table display
        table_data = df.to_dict('records')
        return render_template('dashboard.html', kpis=kpis, table_data=table_data)
    except Exception as e:
        return f"Error loading data: {str(e)}", 500

@app.route('/api/status-distribution')
def api_status_distribution():
    """API endpoint for status distribution data"""
    df = load_data()
    data = get_status_distribution(df)
    return jsonify(data)

@app.route('/api/recent-status-distribution')
def api_recent_status_distribution():
    """API endpoint for recent status distribution data"""
    df = load_data()
    data = get_recent_status_distribution(df)
    return jsonify(data)

@app.route('/api/store-distribution')
def api_store_distribution():
    """API endpoint for store distribution data"""
    df = load_data()
    data = get_store_distribution(df)
    return jsonify(data)

@app.route('/api/transition-timeline')
def api_transition_timeline():
    """API endpoint for transition timeline data"""
    df = load_data()
    data = get_transition_timeline(df)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
