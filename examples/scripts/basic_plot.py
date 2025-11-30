"""
Basic Plot Example
Use this to test "Improve This Plot" feature

Instructions:
1. Run this code to see the basic plot
2. Select the plot code (lines 14-16)
3. Right-click → "Claude Studio: Improve This Plot"
4. Claude will suggest improvements and provide enhanced code
"""

import pandas as pd
import matplotlib.pyplot as plt

# Load patient data
data = pd.read_csv("examples/data/patient_data.csv")

# Basic boxplot - try to improve this!
data.boxplot(column='blood_pressure_systolic', by='treatment')
plt.show()
