import pandas

df = pandas.read_csv(r"google-play-store-apps\googleplaystore.csv")

df = df.drop(['Last Updated',
              'Android Ver',
              'Content Rating',
              'Current Ver',
              'App'], axis=1)

df = df.fillna(0)


cats = list(df['Category'])

d ={}

for c in cats:
    if c in d:
        d[c] += 1
    else:
        d[c] = 1

values = list(d.values())
values.sort()

top_vals = values[-10:]
top_cats = []
for k in d:
    if d[k] in top_vals:
        top_cats.append((k))
        top_vals.pop(top_vals.index(d[k]))


cat_data_dict = {}
print(top_cats)
for cat in top_cats:
    print(cat)
    cat_data_dict[cat] = df[df['Category'] == cat]

print(cat_data_dict)
# price = Com[Com.columns[6]].replace('[\$,]+', '', regex=True).astype(float)
