# Patient Status Dashboard

A Flask-based dashboard for visualizing patient status analytics from the output_table.xlsx file.

## Features

- **KPI Cards**: Display key metrics including total patients, active/inactive/lapsed counts, and store activity
- **Interactive Charts**:
  - Patient Status Distribution (Pie Chart)
  - Recent Status Breakdown (Bar Chart)
  - Top 10 Stores by Patient Activity (Bar Chart)
  - Status Transition Timeline (Line Chart)
- **Single Page Design**: Non-scrollable layout with all information visible at once
- **Responsive Design**: Adapts to different screen sizes

## Project Structure

```
dashboard/
├── app.py                      # Flask application
├── requirements.txt            # Python dependencies
├── README.md                   # This file
├── static/
│   ├── css/
│   │   └── style.css          # Dashboard styling
│   └── js/
│       └── charts.js          # Chart rendering logic
└── templates/
    └── dashboard.html         # Main dashboard template
```

## Installation

1. Navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install required packages:
```bash
pip install -r requirements.txt
```

## Running the Dashboard

1. Make sure the `output_table.xlsx` file exists in `../data/processed/`

2. Start the Flask server:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Data Requirements

The dashboard expects an Excel file (`output_table.xlsx`) with the following columns:
- `entrp_ptnt_id`: Patient ID
- `eff_dt`: Effective date
- `status`: Patient status (Active, Inactive, Lapsed, Lost, Unknown)
- `recent_status`: Recent status (Recently New, Recently Reactivated, Active Continuing, Inactive Continuing, Unknown)
- `transition_dt`: Status transition date
- `prev_store_nbr`: Previous store number

## Customization

- **Colors**: Modify the color schemes in `static/js/charts.js`
- **Layout**: Adjust grid layouts and spacing in `static/css/style.css`
- **KPIs**: Add or modify KPI calculations in `app.py`
- **Charts**: Customize chart types and configurations in `static/js/charts.js`

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript
- **Charting Library**: Plotly.js
- **Data Processing**: Pandas
