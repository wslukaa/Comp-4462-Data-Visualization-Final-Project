from sklearn.cluster import KMeans
import csv

with open("clursering_data.csv") as file:
    num_roles = sum(1 for row in file)
    file.close()

with open("clursering_data.csv") as csv_file:
    reader = csv.reader(csv_file, delimiter=',', quotechar='|')
    is_first = True
    universities = []
    universities_name = []
    sat_scores = []
    for row in reader:

        if is_first:
            is_first = False
            continue
        rate = 0.0
        university_name = row[3]
        average_sat_score = 0
        if row[36] != "NULL":
            rate = float(row[36])
        income_rate = 0
        if row[1606] != "NULL" and row[1606] != "PrivacySuppressed":
            income_rate = float(row[1606])
        state = row[5]
        if rate != 0 and income_rate != 0:
            university_clustering_attributes = (rate * 22, income_rate)
            universities.append(university_clustering_attributes)
            universities_name.append(university_name)

db = KMeans(n_clusters=8).fit(universities)
universities_labels = []
for i in range(len(db.labels_)):
    universities_labels.append([])
for i in range(len(db.labels_)):
    universities_labels[i] = [universities_name[i]]
    universities_labels[i].append(str(universities[i][0]/22))
    universities_labels[i].append(str(universities[i][1]))
    universities_labels[i].append(str(db.labels_[i]))

with open("clustering_result_age.csv", mode='w') as written_file:
    written_file = csv.writer(written_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in universities_labels:
        written_file.writerow(row)
