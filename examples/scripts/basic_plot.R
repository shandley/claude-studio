# Basic Plot Example
# Use this to test "Improve This Plot" feature
#
# Instructions:
# 1. Run this code to see the basic plot
# 2. Select ALL the plot code (lines 10-13)
# 3. Right-click → "Claude Studio: Improve This Plot"
# 4. Claude will suggest improvements and provide enhanced code

library(ggplot2)

# Load patient data
data <- read.csv("examples/data/patient_data.csv")

# Basic boxplot - try to improve this!
ggplot(data, aes(x = treatment, y = blood_pressure_systolic)) +
  geom_boxplot()
