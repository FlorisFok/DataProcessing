import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns
import json

print('___________\nFor regression bonus, please see my preivious visualization excersize\n_______________')

# Get path and make dataframe
path = "input.csv"
df = pd.read_csv(path)

# Round up and down of Histogram
ROUND = 500
OUTLIER_ACCAPTANCE = 1 #give 4 to only remove the 400.000
COLUMNS = [0,1,4,7,8] # COLUMNS you want to use

# Get keys and select nessecarry columns
items = [key for i,key in enumerate(list(df)) if i in COLUMNS]
df = df[items]

# Useful check
print('All countries only exist ones:')
print(df['Country'].is_unique)

# Remove all the rows with inconsitincies
fail = []
for index, row in df.iterrows():
    # Check for None and correct type
    try:
        if len(row[0]) < 2:
            raise
        if len(row[1]) < 2:
            raise
        df.iloc[[index], [1]] = row[1].capitalize()

        three = float(row[2].replace(',','.'))
        df.iloc[[index], [2]] = three

        four = float(row[3].replace(',','.'))
        df.iloc[[index], [3]] = four

        # Dollars is already noted at the top
        five = int(row[4].replace(' dollars',''))
        df.iloc[[index], [4]] = five

    except Exception as e:
        # Print all errors that occured
        fail.append(index)
        print(index)
        print(e)

# Remove wrong values
df = df.drop(fail)

# Get data
GDP = df[list(df)[4]]
gdp = np.array(GDP)

# Get some charataristics
mean = gdp.mean()
median = np.median(gdp)
modulo = stats.mode(gdp)[0][0]

# Print summary
print('-------------------')
print('Summary of the GDP')
print('Mean: %.3f' % mean)
print('Median: %.3f' % median)
print('Mode: %.3f' % modulo)
print('-------------------')

# Pop outlier by selecting 100%
quarts = np.percentile(GDP, [25, 50, 75])
lent = len(GDP)
# Convert % to value
q2 = quarts[1]
q3 = quarts[2]
gdp = [i for i in list(GDP) if i < q3 + (q3 - q2)*OUTLIER_ACCAPTANCE]

# Empty vars for the loop
d = {}
bars = []
bins = []

# Rounds and counts
for i in gdp:
    # Round values
    i = int(i/ROUND)
    i *= ROUND
    bars.append(i)
    # Find unique values and count
    if i in d:
        d[i] += 1
    else:
        d[i] = 1
        bins.append(i)

# Sort
bins.sort()


# Get Infant data
data = df[list(df)[3]]

# calculate quartiles
quarts = np.percentile(data, [25, 50, 75])

# calculate min/max
data_min, data_max = data.min(), data.max()

def save2json(df, filename = 'data.json'):
    '''
    Save to json function, first row is seen as index
    '''
    d = {}
    keys = list(df)
    for index, row in df.iterrows():
        d[row[0]] = {}
        for i, item in enumerate(row[1:]):
            d[row[0]][keys[i+1]] = item

    with open(filename, 'w') as outfile:
        json.dump(d, outfile)


# print 5-number summary
print("Infant 5-number summary")
print('Min: %.3f' % data_min)
print('Q1: %.3f' % quarts[0])
print('Median: %.3f' % quarts[1])
print('Q3: %.3f' % quarts[2])
print('Max: %.3f' % data_max)
print('-------------------')

print('Saving to JSON')
save2json(df, 'json_data.json')
print("Done!")

plt.subplot(211)
plt.hist(bars, bins)
plt.title("Histogram of GDP")
plt.xlabel(" GDP [$]")
plt.ylabel(" Frequency []")

plt.subplot(212)
plt.title("Box plot of Infant mortality")
plt.xlabel("Infant mortality (per 1000 births)")
sns.boxplot(x=list(df['Infant mortality (per 1000 births)']))

plt.tight_layout()
plt.show()
