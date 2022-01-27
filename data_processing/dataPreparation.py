import requests
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import os

def lastDataDep():
    date = datetime.today() - timedelta(days=1)
    dateSTR = date.strftime('%d-%m-%Y')
    
    url = "https://coronavirusapifr.herokuapp.com/data/departements-by-date/" + str(dateSTR)
    print(url)
    resp = requests.get(url)
    respIsOK = False
    i = 1
    while(respIsOK == False):
        try:
            resp.json()
            respIsOK = True
        except ValueError:
            i = i + 1
            date = datetime.today() - timedelta(days=i)
            dateSTR = date.strftime('%d-%m-%Y')
            url = "https://coronavirusapifr.herokuapp.com/data/departements-by-date/" + str(dateSTR)
            print(url)
            resp = requests.get(url)
            
    txt = resp.json()
#    print(txt)
    df = pd.DataFrame(txt)
#    print(df)
#    
#    print(df.columns)
    
    df["date"].fillna(dateSTR)
#    
    dfFinal = df[['dep', 'date','pos', 'pos_7j']]
    #print(dfFinal.columns)
    #
#    print(dfFinal)
    
#    if(os.path.isfile('./final_data/' + dateSTR + '.json') == False):
#        dfFinal.to_json('./final_data/' + dateSTR + '.json', orient="records")
#    else :
#        print("Fichier déjà existant !")

    return str(dfFinal.to_json(orient="records"))


# Format Date "dd-mm-yyyy"
def dataDepAtDate(date):
    dateSTR = date
    if(datetime.strptime(date, '%d-%m-%Y')>(datetime.today() - timedelta(days=1))):
        return None
    url = "https://coronavirusapifr.herokuapp.com/data/departements-by-date/" + str(date)
    print(url)
    
    resp = requests.get(url)
    respIsOK = False
    i = 1
    while(respIsOK == False):
        try:
            resp.json()
            respIsOK = True
        except ValueError:
            i = i + 1
            date = datetime.strptime(date, '%d-%m-%Y') - timedelta(days=1)
            dateSTR = date.strftime('%d-%m-%Y')
            url = "https://coronavirusapifr.herokuapp.com/data/departements-by-date/" + str(dateSTR)
            print(url)
            resp = requests.get(url)
            
    txt = resp.json()
            
    df = pd.DataFrame(txt)
#    print(df)
#    
#    print(df.columns)
    
    df["date"].fillna(dateSTR)
#    
    dfFinal = df[['dep', 'date','pos', 'pos_7j']]
    #print(dfFinal.columns)
    #
#    print(dfFinal)
    
#    if(os.path.isfile('./final_data/' + dateSTR + '.json') == False):
#        dfFinal.to_json('./final_data/' + dateSTR + '.json', orient="records")
#    else :
#        print("Fichier déjà existant !")
        
    return str(dfFinal.to_json(orient="records"))
#dataAtDate("05-01-2022")
print(lastDataDep())
print(dataDepAtDate("03-01-2022"))




















