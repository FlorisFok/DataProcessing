import pandas
import json

## info from CSV
START = 6
END = 361
COL = 4

# File names
file = r"Monthly_traffic_data_1992-current.xlsx"
file2 = r"KNMI_20190331.txt"

# Data from Excel
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

# Windspeed data from csv
df2 = pandas.read_csv(file2)
wind_speed = list(df2["FHVEC"])

# From windspeed per day to wind speed per month
monthdays_list = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
avg_wind = []

# Check for each month, number of days and pop numbers of days from the list
for m in month:
    days = monthdays_list[month_list.index(m)] - 1

    wind_speed_temp = wind_speed[:days]
    wind_speed = wind_speed[days:]
    # Average calculation
    avg_wind.append(int(sum(wind_speed_temp)/days))

# Create Json
data_dict = {'month':month, 'num_time':time, 'data':data_minus_total, 'wind':avg_wind}
data_json = json.dumps(data_dict)

# Save to file
with open('data.json', 'w') as f:
    f.write(data_json)

print(max(avg_wind))
print(min(avg_wind))

print(max(data_minus_total))
print(min(data_minus_total))
