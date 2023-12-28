import re

# Function to process the SQL file
def process_sql_file(input_file, output_file):
    with open(input_file, 'r') as infile, open(output_file, 'w') as outfile:
        for line in infile:
            # Convert 'uuid' column to TEXT data type
            if "'uuid'" in line:
                line = line.replace("INTEGER NOT NULL", "TEXT NOT NULL")

            # Enclose UUID values in quotes
            if line.startswith("INSERT INTO"):
                line = re.sub(r'(\d+\.\d+e[+-]\d+)', r"'\1'", line)

            outfile.write(line)

# Read SQL file, process lines, and write to output file
input_file = 'data/doctor_who_original.sql'
output_file = 'data/doctor_who_processed.sql'


process_sql_file(input_file, output_file)
print("Processing completed. Output saved to:", output_file)