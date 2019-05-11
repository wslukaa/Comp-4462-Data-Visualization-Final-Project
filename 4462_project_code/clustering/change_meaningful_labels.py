import csv

label_dictionary = {}
label_dictionary["0"] = "Absolutely low SAT score and comparatively high admission rate"
label_dictionary["1"] = "Medium SAT score and medium admission rate"
label_dictionary["2"] = "Comparatively high SAT score and comparatively low admission rate"
label_dictionary["3"] = "Absolutely low SAT score and absolutely low admission rate"
label_dictionary["4"] = "Absolutely low SAT score and absolutely high admission rate"
label_dictionary["5"] = "Absolutely low SAT score and comparatively low admission rate"
label_dictionary["6"] = "Medium SAT score and comparatively high admission rate"
label_dictionary["7"] = "Absolutely high SAT score and absolutely low admission rate"

rows = []
with open("clustering_result.csv") as file:
    reader = csv.reader(file, delimiter=',', quotechar='|')
    for row in reader:
        row[3] = label_dictionary[row[3]]
        rows.append(row)
    file.close()

with open("clustering_result_sat_clean.csv", mode='w') as file:
    written_file = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        written_file.writerow(row)
