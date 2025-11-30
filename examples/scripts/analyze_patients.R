# Patient Data Analysis Script
# This script demonstrates various statistical analyses on clinical trial data

library(dplyr)
library(ggplot2)

analyze_treatment_effect <- function(data, treatment_col, outcome_col) {
  data %>%
    group_by(!!sym(treatment_col)) %>%
    summarize(
      n = n(),
      mean_improvement = mean(!!sym(outcome_col) == "Improved"),
      sd_improvement = sd(!!sym(outcome_col) == "Improved")
    )
}

plot_blood_pressure <- function(data, treatment_groups) {
  ggplot(data, aes(x = treatment, y = blood_pressure_systolic, fill = treatment)) +
    geom_boxplot() +
    theme_minimal() +
    labs(
      title = "Blood Pressure by Treatment Group",
      x = "Treatment",
      y = "Systolic BP (mmHg)"
    )
}

compare_age_distribution <- function(control_group, treatment_group) {
  t.test(control_group, treatment_group, var.equal = TRUE)
}

calculate_effect_size <- function(data, group_var, outcome_var) {
  groups <- split(data[[outcome_var]], data[[group_var]])

  mean_diff <- mean(groups[[1]]) - mean(groups[[2]])
  pooled_sd <- sqrt((var(groups[[1]]) + var(groups[[2]])) / 2)

  cohens_d <- mean_diff / pooled_sd
  return(cohens_d)
}
