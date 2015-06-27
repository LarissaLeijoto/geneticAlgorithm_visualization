#!/usr/bin/python

import sys

aminoacids = { "ASP": 1, "GLU": 2, "ALA": 3, "ARG": 4, "ASN": 5, "CYS": 6, \
               "PHE": 7, "GLY": 8, "GLN": 9, "HIS": 10, "ILE": 11, "LEU": 12, \
               "LYS": 13, "MET": 14, "PRO": 15, "SER": 16, "TYR": 17, "THR": 18, \
               "TRP": 19, "VAL": 20 }

# Compute metrics for a given individual.
def process(individual, fitness):
  # Computes X coordinate.
  sumList = []

  for i in xrange(len(individual)):
    sumI = 0
    for j in xrange(len(individual[i])):
      sumI += (aminoacids[individual[i][j]] * (j+1))

    sumList.append(sumI)

  x = float(sum(sumList)) / float(len(sumList))


  # Computes Y coordinate.
  sumList = []
  proteinLength = len(individual[0])

  for i in xrange(proteinLength):
    sumI = 0
    for j in xrange(len(individual)):
      sumI += aminoacids[individual[j][i]] * j

    sumList.append(sumI)

  y = float(sum(sumList)) / float(len(sumList))

  return [x, y, fitness]

def normalize(solution):
  for i in xrange(len(solution)):
    for j in xrange(len(solution[i])):
      solution[i][j][0] = (solution[i][j][0] - lowX) / (highX - lowX)
      solution[i][j][1] = (solution[i][j][1] - lowY) / (highY - lowY)
      solution[i][j][2] = float(solution[i][j][2] - fitLow) / float(fitHigh - fitLow)

  return

if sys.argv[1] == "-h" or sys.argv[1] == "--help":
  print "Usage: ./pre-process -p N -f PATH"

numProt = int(sys.argv[2]) # Number of preteins in an individual.
file = open(sys.argv[4])

# Space bounds.
lowX = 0.0
highX = 0.0
lowY = 0.0
highY = 0.0
fitLow = 0
fitHigh = 0

firstIt = True

currentGen = -1
solution = []
generation = []

line = ""
broke = False

while True:
  line = file.readline()

  if line.startswith("generation: "):
    if currentGen != -1:
      solution.append(generation)
      generation = []

    line = line.strip()
    previousGen = currentGen
    currentGen = str(line.split("generation: ")[-1])

    if (int(currentGen) < int(previousGen)):
      broke = True
      break

    print >> sys.stderr, "Generation: " + str(currentGen)
    file.readline()

  # Skip offset.
  line = file.readline()

  # Break at the end of file.
  if not line:
    break

  individual = []

  # Extract each protein from this individual.
  for i in range(numProt):
    line = file.readline()
    line = line.strip()

    protein = line.split(" ")
    individual.append(protein)

  file.readline()
  fitness = int(file.readline())

  # Process this specific individual.
  coord = process(individual, fitness)
  generation.append(coord)

  # Update space bounds.
  if firstIt:
    firstIt = False
    lowX = coord[0]
    highX = coord[0]
    lowY = coord[1]
    highY = coord[1]
    fitLow = coord[2]
    fitHigh = coord[2]
  else:
    if coord[0] < lowX:
      lowX = coord[0]
    if coord[0] > highX:
      highX = coord[0]
    if coord[1] < lowY:
      lowY = coord[1]
    if coord[1] > highY:
      highY = coord[1]
    if coord[2] < fitLow:
      fitLow = coord[2]
    if coord[2] > fitHigh:
      fitHigh = coord[2]

if not broke:
  solution.append(generation)

normalize(solution)

print solution
