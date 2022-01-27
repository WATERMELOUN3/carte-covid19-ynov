import requests
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
# NOK import JSONDecodeError

#def departement(dep):
#    return {
#            "1" : [70.63, -160.00],
#            "2" : [49.47, 3.44],
#            "3" : [46.31, 3.41],
#            "4" : [44.07, 6.23],
#            "5" : [44.60, 6.32],
#            "6" : [43.94, 7.17],
#            "7" : [44.75, 4.56],
#            "8" : [49.76, 4.62],
#            "9" : [,],
#            "10" : [,],
#            "11" : [,],
#            "12" : [,],
#            "13" : [,],
#            "14" : [,],
#            "15" : [,],
#            "16" : [,],
#            "17" : [,],
#            "18" : [,],
#            "19" : [,],
#            "2A" : [,],
#            "2B" : [,],
#            "21" : [,],
#            "22" : [,],
#            "23" : [,],
#            "24" : [,],
#            "25" : [,],
#            "26" : [,],
#            "27" : [,],
#            "28" : [,],
#            "29" : [,],
#            "30" : [,],
#            "31" : [,],
#            "32" : [,],
#            "33" : [,],
#            "34" : [,],
#            "35" : [,],
#            "36" : [,],
#            "37" : [,],
#            "38" : [,],
#            "39" : [,],
#            "40" : [,],
#            "41" : [,],
#            "42" : [,],
#            "43" : [,],
#            "44" : [,],
#            "45" : [,],
#            "46" : [,],
#            "47" : [,],
#            "48" : [,],
#            "49" : [,],
#            "50" : [,],
#            "51" : [,],
#            "52" : [,],
#            "53" : [,],
#            "54" : [,],
#            "55" : [,],
#            "56" : [,],
#            "57" : [,],
#            "58" : [,],
#            "59" : [,],
#            "60" : [,],
#            "61" : [,],
#            "62" : [,],
#            "63" : [,],
#            "64" : [,],
#            "65" : [,],
#            "66" : [,],
#            "67" : [,],
#            "68" : [,],
#            "69" : [,],
#            "70" : [,],
#            "71" : [,],
#            "72" : [,],
#            "73" : [,],
#            "74" : [,],
#            "75" : [,],
#            "76" : [,],
#            "77" : [,],
#            "78" : [,],
#            "79" : [,],
#            "80" : [,],
#            "81" : [,],
#            "82" : [,],
#            "83" : [,],
#            "84" : [,],
#            "85" : [,],
#            "86" : [,],
#            "87" : [,],
#            "88" : [,],
#            "89" : [,],
#            "90" : [,],
#            "91" : [,],
#            "92" : [,],
#            "93" : [,],
#            "94" : [,],
#            "95" : [,],
#            "971" : [,],
#            "972" : [,],
#            "973" : [,],
#            "974" : [,],
#            "976" : [,],
#            }[dep]
#
#def coordGeoJson(df):
#    listCoordsForDF = []
#    for row in df:
#        departement(str(df["dep"]))

def lastData():
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
            
    df = pd.DataFrame(txt)
    print(df)
    
    print(df.columns)
    
    dfFinal = df[['dep', 'lib_dep', 'reg', 'lib_reg', 'pos', 'pos_7j']]
    #print(dfFinal.columns)
    #
    print(dfFinal)
    return dfFinal


# Format Date "dd-mm-yyyy"
def dataAtDate(date):
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
    print(df)
    
    print(df.columns)
    
    dfFinal = df[['dep', 'lib_dep', 'reg', 'lib_reg', 'pos', 'pos_7j']]
    #print(dfFinal.columns)
    #
    print(dfFinal)
    return dfFinal
#dataAtDate("05-01-2022")





















