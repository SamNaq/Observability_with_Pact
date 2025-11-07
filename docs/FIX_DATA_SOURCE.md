# Fixing Data Source Selection in Grafana Dashboard

## 🔍 Problem

When importing the dashboard, you don't see an option to select the Prometheus data source.

## ✅ Solution Options

### Option 1: Import First, Then Select Data Source

1. **Click "Import"** on the import page (even without data source selection)
2. After import, Grafana will likely show a dialog asking you to select the Prometheus data source
3. Select your Prometheus data source from the dropdown
4. Click "Save" or "OK"

### Option 2: Fix Data Source After Import

If the data source selection doesn't appear automatically:

1. **After importing**, go to the dashboard
2. Click the **gear icon (⚙️)** at the top right → **"Settings"**
3. Look for **"Variables"** tab or **"Data Sources"** section
4. Find the `${DS_PROMETHEUS}` variable
5. Set it to your Prometheus data source

### Option 3: Edit Dashboard Panels Manually

1. **After importing**, click **"Edit"** button (pencil icon)
2. Click on any panel that shows "No data"
3. In the panel editor, find the **"Data source"** dropdown
4. Select your **Prometheus** data source
5. Click **"Apply"** or **"Save"**
6. Repeat for other panels if needed

### Option 4: Update Dashboard JSON Before Import

If you know your Prometheus data source UID, I can update the dashboard JSON to use it directly.

**To find your Prometheus data source UID:**
1. Go to Grafana Cloud → **"Connections"** → **"Data Sources"**
2. Click on your **Prometheus** data source
3. Look at the URL - it will show something like `/datasources/edit/xxxxx`
4. The `xxxxx` is the UID

**Or:**
1. Go to **"Explore"** in Grafana
2. Select your Prometheus data source
3. The UID will be in the URL or data source selector

## 🔧 Quick Fix: Use Default Prometheus

If you have a Prometheus data source already configured, I can update the dashboard to use it directly instead of a variable.

Let me know:
1. Do you already have a Prometheus data source configured in Grafana Cloud?
2. What's the name of your Prometheus data source?

I can then update the dashboard JSON to use it directly.

## 📝 Alternative: Import and Fix Later

You can also:
1. Import the dashboard as-is
2. After import, edit each panel
3. Change the data source from `${DS_PROMETHEUS}` to your actual Prometheus data source
4. Save the dashboard

This works but is more tedious if you have many panels.




