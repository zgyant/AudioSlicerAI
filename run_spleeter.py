import argparse
import os

# Set up the argument parser
parser = argparse.ArgumentParser(description='Separate audio sources using Spleeter.')
parser.add_argument('-i', '--input', help='Path to the input audio file')
parser.add_argument('-o', '--output', help='Path to the output directory')
parser.add_argument('-p', '--params', help='Spleeter configuration parameters')
args = parser.parse_args()

# Get the input audio path, output directory path, and Spleeter configuration parameters
input_path = args.input
output_dir = args.output
params = args.params

os.system(f"spleeter separate -p {params} -o {output_dir} {input_path}")