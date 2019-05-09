import pandas
import json


# Import csv to DataFrame
df = pandas.read_csv(r"google-play-store-apps\googleplaystore.csv")

# Drop the shitty columns
df = df.drop(['Last Updated',
              'Android Ver',
              'Content Rating',
              'Current Ver',
              'App', 'Type',
              'Size'], axis=1)

# Replace missing values with 0
df = df.fillna(0)

def get_top_cats(df, col_name, top):
    ''' Selects the top occuring in a dataframe column'''
    # Make list from data frame
    cats = list(df[col_name])
    d ={}

    # Count occurance of items in list
    for c in cats:
        if c in d:
            d[c] += 1
        else:
            d[c] = 1

    # Sort the values of counted values
    values = list(d.values())
    values.sort()

    # Retrive the keys corresponding to top values
    top_vals = values[-top:]
    top_cats = []
    for k in d:
        if d[k] in top_vals:
            top_cats.append((k))
            top_vals.pop(top_vals.index(d[k]))

    # Return top values
    return top_cats

# Get the top Categories of the Apps
top_cats = get_top_cats(df, col_name='Category', top=10)

# Make data dict
data = {}
for cat in top_cats:
    # Select disired category
    temp_df =  df[df['Category'] == cat]

    # Strip data, remove all special charactars and convert to flaot
    price = temp_df['Price'].str.replace('[\$,]+', '',
                                         regex=True).astype(float)
    installs = temp_df['Installs'].str.rstrip(r'+')
    installs = installs.str.replace(',', '',
                                    regex=True).astype(int)
    reviews = temp_df['Reviews'].astype(float)

    # Replace old data with stripped data
    temp_df.loc[:, 'Price'] = pandas.Series(price, index = temp_df.index)
    temp_df.loc[:, 'Installs'] = pandas.Series(installs, index = temp_df.index)
    temp_df.loc[:, 'Reviews'] = pandas.Series(reviews, index = temp_df.index)

    def save_describe(temp_df):
        '''
        Save the values of descibe in a dict, keeps the same order.
        This dict can be converted to json
        '''
        names = list(temp_df)

        # Get values from describe method and names of columns
        values = temp_df.describe().values
        des_names = list(temp_df.describe().index)

        # add values to the name of the values
        small_data = {}
        for i, val in enumerate(values):
            small_data[des_names[i]] = list(val)

        # Create a last list of the colums in the data frame
        small_data['Columns'] = names[1:-1]
        return small_data

    # Collect the data for the bar plot
    data[cat] = save_describe(temp_df)

data_json = json.dumps(data)

# Save to file
with open('data.json', 'w') as f:
    f.write(data_json)

data2 = []

for key in data:
    temp = data[key]
    data2.append({'Letter':key.capitalize(),'Freq':temp['mean'][0]})

data_json2 = json.dumps(data2)

# Save to file
with open('data2.json', 'w') as f:
    f.write(data_json2)
