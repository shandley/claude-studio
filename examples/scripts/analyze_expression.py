"""
Gene Expression Analysis Module
Analyzes differential gene expression data from RNA-seq experiments
"""

import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import seaborn as sns


def load_expression_data(filepath):
    df = pd.read_csv(filepath)
    return df


def filter_significant_genes(data, p_threshold=0.05, fc_threshold=1.5):
    significant = data[
        (data['p_value'] < p_threshold) &
        (abs(data['fold_change']) > fc_threshold)
    ]
    return significant


def plot_volcano(data, p_threshold=0.05, fc_threshold=1.5):
    fig, ax = plt.subplots(figsize=(10, 8))

    ax.scatter(
        data['fold_change'],
        -np.log10(data['p_value']),
        c=data['significant'].map({True: 'red', False: 'gray'}),
        alpha=0.6
    )

    ax.axhline(-np.log10(p_threshold), color='blue', linestyle='--', alpha=0.5)
    ax.axvline(fc_threshold, color='blue', linestyle='--', alpha=0.5)
    ax.axvline(-fc_threshold, color='blue', linestyle='--', alpha=0.5)

    ax.set_xlabel('Fold Change (log2)')
    ax.set_ylabel('-log10(p-value)')
    ax.set_title('Volcano Plot: Differential Gene Expression')

    return fig


def calculate_pathway_enrichment(gene_list, pathway_db):
    enriched_pathways = []

    for pathway in pathway_db:
        overlap = set(gene_list) & set(pathway['genes'])

        if len(overlap) > 0:
            p_value = stats.hypergeom.sf(
                len(overlap) - 1,
                len(pathway_db['total_genes']),
                len(pathway['genes']),
                len(gene_list)
            )

            enriched_pathways.append({
                'pathway': pathway['name'],
                'overlap': len(overlap),
                'p_value': p_value
            })

    return pd.DataFrame(enriched_pathways)


class ExpressionAnalyzer:
    def __init__(self, data):
        self.data = data
        self.significant_genes = None

    def run_analysis(self, p_threshold=0.05, fc_threshold=1.5):
        self.significant_genes = filter_significant_genes(
            self.data,
            p_threshold,
            fc_threshold
        )

        return self.significant_genes

    def get_summary_stats(self):
        return {
            'total_genes': len(self.data),
            'significant_genes': len(self.significant_genes),
            'upregulated': len(self.significant_genes[self.significant_genes['fold_change'] > 0]),
            'downregulated': len(self.significant_genes[self.significant_genes['fold_change'] < 0])
        }
