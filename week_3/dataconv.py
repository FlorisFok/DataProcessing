import pandas
import json

## info from CSV
START = 6
END = 361
COL = 4

# Data from csv
file = r"Monthly_traffic_data_1992-current.xlsx"
df = pandas.read_excel(file)
key = list(df)[COL]
temp_list = list(df[key])

# Remove junk from list
data = temp_list[START:END]
data_minus_total = [i for n,i in enumerate(data) if n%13 != 0]

# Add month and numerical time
time = list(range(len(data_minus_total)))
month_list = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
month = [month_list[i%12] for i in time]

# Create Json
data_dict = {'month':month, 'num_time':time, 'data':data_minus_total}
data_json = json.dumps(data_dict)

# Save to file
with open('data.json', 'w') as f:
    f.write(data_json)
