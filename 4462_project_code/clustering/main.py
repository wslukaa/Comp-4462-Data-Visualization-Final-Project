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
        if row[44] != "NULL":
            if (row[45] == "NULL"):
                average_sat_score = 2 * float(row[44])
            else:
                average_sat_score = float(row[44]) + float(row[45])
        state = row[5]
        if rate != 0 and average_sat_score != 0:
            university_clustering_attributes = (rate*800, average_sat_score)
            universities.append(university_clustering_attributes)
            universities_name.append(university_name)

db = KMeans(n_clusters=8).fit(universities)
universities_labels = []
for i in range(len(db.labels_)):
    universities_labels.append([])
for i in range(len(db.labels_)):
    universities_labels[i] = [universities_name[i]]
    universities_labels[i].append(str(universities[i][0]/800))
    universities_labels[i].append(str(universities[i][1]))
    universities_labels[i].append(str(db.labels_[i]))

with open("clustering_result.csv", mode='w') as written_file:
    written_file = csv.writer(written_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    for row in universities_labels:
        written_file.writerow(row)


