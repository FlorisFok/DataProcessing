import pandas
import json


# Read file
file_name = "KNMI_20190428.txt"
df = pandas.read_csv(file_name)

# YYYYMMDD = Datum (YYYY=jaar MM=maand DD=dag);
time = list(df['YYYYMMDD'])
day_number = list(range(1,len(time)+1))

# FHX      = Hoogste uurgemiddelde windsnelheid (in 0.1 m/s);
h_mean = list(df['FHX'])

# FHN      = Laagste uurgemiddelde windsnelheid (in 0.1 m/s);
l_mean = list(df['FHN'])

# FXX      = Hoogste windstoot (in 0.1 m/s);
m_peak = list(df['FXX'])

# convert to DICT
data_dict = {
    'time_stamp':time,
    'day':day_number,
    'average_high':h_mean,
    'average_low':l_mean,
    'max_peak':m_peak}

# Convert to JSON
data_json = json.dumps(data_dict)

# Save to file
with open('data.json', 'w') as f:
    f.write(data_json)
