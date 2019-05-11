import csv

label_dictionary = {}
label_dictionary["0"] = "Absolutely high ratio of low income family and absolutely high admission rate"
label_dictionary["1"] = "Medium ratio of low income family and absolutely high admission rate"
label_dictionary["2"] = "Medium ratio of low income family and absolutely low admission rate"
label_dictionary["3"] = "Absolutely high ratio of low income family and absolutely high admission rate"
label_dictionary["4"] = "Comparatively low ratio of low income family and medium admission rate"
label_dictionary["5"] = "Absolutely high ratio of low income family and comparatively high admission rate"
label_dictionary["6"] = "Medium ratio of low income family and medium admission rate"
label_dictionary["7"] = "Absolutely low ratio of low income family and absolutely high admission rate"

rows = []
with open("clustering_result_income.csv") as file:
    reader = csv.reader(file, delimiter=',', quotechar='|')
    for row in reader:
        row[3] = label_dictionary[row[3]]
        rows.append(row)
    file.close()

with open("clustering_result_income_clean.csv", mode='w') as file:
    written_file = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        written_file.writerow(row)
