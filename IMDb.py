import requests
from bs4 import BeautifulSoup
import pandas
import matplotlib.pyplot as plt
import sys
import re

PAGE_LEN = 50

MIN_VOTES = 5000
START_DATE = "2008-01-01"
END_DATE = "2018-01-01"

url_begin = "https://www.imdb.com/search/"
url_search = "title?title_type=feature&"
url_date = f"release_date={START_DATE},{END_DATE}&"
url_votes = f"num_votes={MIN_VOTES},&"
url_sort = "sort=user_rating,desc&"

def get_soup(url):
    '''
    Fetch soup from cerrtain url.
    '''
    try:
        source_code = requests.get(url)
    except requests.exceptions.RequestException as e:
        print(e)
        sys.exit(1)

    plain_text = source_code.text
    soup = BeautifulSoup(plain_text, 'html.parser')

    return soup

def movie_page_list(soup, page_num):
    '''
    Finds movie discriptions
    '''
    one_page = soup.find_all('div', {'class': 'lister-item-content'})
    if not len(one_page) == PAGE_LEN and len(one_page) != 0:
        print(f"Page {page_num}, only found {len(one_page)} movies")
    return one_page

def make_dict(movie):
    '''
    Exctract data from parsed movie description
    Returns a dict of data values
    '''
    # Find title by selecting first <a>
    title = movie.find_all('a')[0].text

    # Parse and select year
    year = movie.find_all('span',{"class":"lister-item-year text-muted unbold"})[0].text
    year = re.findall('\\b\\d+\\b', year)[-1]

    # Parse and select runtime, in min
    runtime = movie.find_all('span',{"class":"runtime"})[0].text
    runtime = re.findall('\\b\\d+\\b', runtime)[-1]

    # Strip and get genre
    genre = movie.find_all('span',{"class":"genre"})[0].text.strip()
    genres = [i.strip() for i in genre.split(',') if i != ' ']

    # Get rating
    rating = movie.find_all('span',{"class":"value"})[0].text

    # Get number of votes and make it convertable to interger
    nv = movie.find_all('span',{"name":"nv"})[0].text.replace(",","")

    # Get all stars
    key_word = 'stars:'
    pees = movie.find_all('p')
    star_string = ''
    for p in pees:
        text = p.text.strip().lower()
        if key_word in text:
            star_string = p
            break

    # Break into actors and directors
    if not star_string == '':
        directors = [i.text.strip() for i in star_string.find_all('a') if '_dr_' in str(i)]
        actors = [i.text.strip() for i in star_string.find_all('a') if '_st_' in str(i)]
    else:
        actors = []
        directors = []

    # Make data dict in correct format
    d = {"title": title, "year": int(year), "runtime": int(runtime), "genre": genres, "rating": float(rating), "votes":int(nv), "actors":actors, "director":directors}
    return d

def main():
    '''
    SCRAPE ALL THE MOVIES
    '''
    # Set list and page num
    DICT_LIST = []
    page_num = 1;

    # Scrape till there's nothing more to scrape
    while True:	
        # Make new url, with right page notation
        page = ((page_num-1) * PAGE_LEN) + 1
        url_page = f"start={page}&ref_=adv_nxt"
        url = url_begin + url_search + url_date + url_votes + url_sort + url_page
        
        # Scrape a page, list all movie elements
        print(page_num, page, end="\r")
        soup = get_soup(url)
        one_page = movie_page_list(soup, page_num)
        
        # Stop scraper when no movies are in the page
        if len(one_page) != 0:
            break

        # Exctract all data from each movie in the list
        for movie in one_page:
            DICT_LIST.append(make_dict(movie))
        page_num += 1
    
    # Make df    
    df = pandas.DataFrame(DICT_LIST)
    print(f"Stopped at page {page_num}")
    # Save to csv
    df.to_csv("IMDb.csv", encoding='utf-8', index=False)
    print("Saved to CSV")
    return df


if __name__ == '__main__':
    main()