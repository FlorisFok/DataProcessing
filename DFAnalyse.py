import pandas
import sys
import matplotlib.pyplot as plt
import numpy as np
import ast

class Analyse(object):

    def __init__(self, df):
        self.df = df
        self.keys = list(df)
        self.length = len(df)

    def get_keys(self):
        return self.keys

    def get_len(self):
        return self.length

    def get_type(self, key):
        return type(self.df[key][0])

    def col_list(self, key):
        return list(self.df[key])

    def str2list(self, col):
        if type(self.df[col][0]) == str:
            for i,l in enumerate(self.df[col]):
                self.df.at[i, col] = ast.literal_eval(l)

    def where(self, contrains):
        '''
        Use more, less, not or equal for ints, floats and strs... ect
        Use in and out for list or list_string
        '''
        for con in contrains:
            if not constrains[con][1] in "not in":
                if constrains[con][1] == 'more':
                    self.df = self.df.loc[df[con] > constrains[con][0]]
                elif constrains[con][1] == 'less':
                    self.df = self.df.loc[self.df[con] < constrains[con][0]]
                elif constrains[con][1] == 'not':
                    self.df = self.df.loc[self.df[con] != constrains[con][0]]
                elif constrains[con][1] == 'equal':
                    self.df = self.df.loc[self.df[con] == constrains[con][0]]
            else:
                self.str2list(con)
                if constrains[con][1] == 'out':
                    ies = [i for i in range(len(self.df)) if not constrains[con][0] in self.df.at[i, con]]
                    self.df = self.df.iloc[ies]
                elif constrains[con][1] == 'in':
                    ies = [i for i in range(len(self.df)) if constrains[con][0] in self.df.at[i, con]]
                    self.df = self.df.iloc[ies]
        self.length = len(self.df)

    def select_list(self, col, list_quant):
        self.df = self.df.loc[df[col].isin(list_quant)]
        self.length = len(self.df)

    def avg(self, col):
        the_list = list(self.df[col])
        return (sum(the_list)/len(the_list))

    def count_all(self, key):
        counts = {}
        for item in self.col_list(key):
            if item in counts:
                counts[item] += 1
            else:
                counts[item] = 1

    def of_each(self, itter, height, avg = False):
        units = set(list(df[itter]))
        heights = []
        for unit in units:
            bar = df.loc[df[itter] == unit]
            bar = bar[height]
            if avg:
                bar = sum(bar)/len(bar)
            else:
                bar = sum(bar)

            heights.append(bar)
        return heights, units

    def list_count(self, key):
        '''
        for genre and actors
        '''
        self.str2list(key)
        genres = {}
        for movie in self.df[key]:
            for gen in movie:
                if gen in genres:
                    genres[gen] += 1
                else:
                    genres[gen] = 1
        return genres

    def list_avg(self, key = 'genre', eva = 'rating'):
        first_dict = {}

        self.str2list(key)

        for genres, other in zip(list(self.df[key]),list(self.df[eva])):
            for single_g in genres:
                single_g = single_g.strip()
                if single_g in first_dict:
                    first_dict[single_g][0] += other
                    first_dict[single_g][1] += 1
                else:
                    first_dict[single_g] = [other, 1]

        for genre in first_dict:
            first_dict[genre].append(first_dict[genre][0]/first_dict[genre][1])

        return first_dict

#### EXTRA ########################################################################################
def max_of_dict(d, ith = None):
    if ith == None:
        value = max([d[k] for k in d])
        key_value = list(d.keys())[list(d.values()).index(value)]
        print(value)
    else:
        value = max([d[k][ith] for k in d])
        full_val = [val for val in d.values() if value in val]
        key_value = list(d.keys())[list(d.values()).index(full_val[0])]


    return key_value, value

def estimate_line(x,y):
    # sort the data
    reorder = sorted(range(len(x)), key = lambda ii: x[ii])
    xd = [x[ii] for ii in reorder]
    yd = [y[ii] for ii in reorder]

    # determine best fit line
    par = np.polyfit(xd, yd, 1, full=True)

    slope=par[0][0]
    intercept=par[0][1]
    xl = range(int(min(xd)), int(max(xd)))
    yl = [slope*xx + intercept  for xx in xl]


    fig = plt.figure(figsize=(15,10))
    plt.scatter(x,y)
    plt.plot(xl, yl, '-r', linewidth=3)
    plt.xlabel('x_values', fontsize=18)
    plt.ylabel('y_values', fontsize=18)
    plt.ylim([0,10])
    plt.title(f'We estimated the followig line: (Slope: {round(slope, 8)}, Start: {round(intercept,2)})', fontsize=18)
    plt.show()

    return xd, yd, xl, yl

def error(ox, oy, ex, ey):
    """
    Error calculation, input: original and estimated x / y.
    """
    error_abs = [abs(rate - ey[ex.index(vote)]) for vote, rate in zip(ox[:-1],oy[:-1])]
    error = [(rate - ey[ex.index(vote)]) for vote, rate in zip(ox[:-1],oy[:-1])]

    return error_abs, error

def print_error(error_abs, error):
    print(f"The average error is: {(sum(error_abs)/len(error_abs))}")
    print(f"The max error is: {max(error)} and min: {min(error)}")

def where(self, constrains = {"rating":[6, 'more'], "runtime":[100, 'more']}):
    '''
    Use more, less, not or equal for ints, floats and strs... ect
    Use in and out for list or list_string
    '''
    for con in constrains:
        if not constrains[con][1] in "not in":
            if constrains[con][1] == 'more':
                df = df.loc[df[con] > constrains[con][0]]
            elif constrains[con][1] == 'less':
                df = df.loc[df[con] < constrains[con][0]]
            elif constrains[con][1] == 'not':
                df = df.loc[df[con] != constrains[con][0]]
            elif constrains[con][1] == 'equal':
                df = df.loc[df[con] == constrains[con][0]]
        else:
            if type(df[con][0]) == str:
                for i,l in enumerate(df[con]):
                    df.at[i, con] = ast.literal_eval(l)
            if constrains[con][1] == 'out':
                ies = [i for i in range(len(df)) if not constrains[con][0] in df.at[i, con]]
                df = df.iloc[ies]
            elif constrains[con][1] == 'in':
                ies = [i for i in range(len(df)) if constrains[con][0] in df.at[i, con]]
                df = df.iloc[ies]
    return df
