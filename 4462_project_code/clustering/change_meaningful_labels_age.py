import csv

label_dictionary = {}
label_dictionary["0"] = "Absolutely young admission and absolutely high admission rate"
label_dictionary["1"] = "Absolutely young admission and comparatively low admission rate"
label_dictionary["2"] = "Absolutely old admission and high admission rate"
label_dictionary["3"] = "Comparatively young admission and comparatively low admission rate"
label_dictionary["4"] = "Medium age admission and medium admission rate"
label_dictionary["5"] = "Absolutely young admission and absolutely low admission rate"
label_dictionary["6"] = "Absolutely young admission and comparatively low admission rate"
label_dictionary["7"] = "Medium age admission and absolutely high admission rate"

rows = []
with open("clustering_result_age.csv") as file:
    reader = csv.reader(file, delimiter=',', quotechar='|')
    for row in reader:
        row[3] = label_dictionary[row[3]]
        rows.append(row)
    file.close()

with open("clustering_result_age_clean.csv", mode='w') as file:
    written_file = csv.writer(file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in rows:
        written_file.writerow(row)
