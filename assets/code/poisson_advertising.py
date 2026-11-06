"""Reproduce the article's probabilities and comparison plot.

python -m pip install numpy scipy matplotlib
python poisson_advertising.py --plot comparison.png
Without --plot, only print numerical results. No ad-account data is needed.
"""
import argparse
import json
import numpy as np
from scipy.stats import binom, poisson


def metrics():
    rows = []
    for p, threshold in [(0.02, 30), (0.2, 230)]:
        n, mu = 1000, 1000 * p
        k = np.arange(n + 1)
        # Include the Poisson mass beyond the binomial support.
        tv = 0.5 * (np.abs(binom.pmf(k, n, p) - poisson.pmf(k, mu)).sum()
                    + poisson.sf(n, mu))
        rows.append(dict(n=n, p=p, mean=mu,
                         binomial_sd=float(binom.std(n, p)),
                         poisson_sd=float(poisson.std(mu)),
                         threshold=threshold,
                         binomial_upper_tail=float(binom.sf(threshold - 1, n, p)),
                         poisson_upper_tail=float(poisson.sf(threshold - 1, mu)),
                         total_variation=float(tv)))
    return dict(comparisons=rows,
                zero_when_mean_2=float(poisson.pmf(0, 2)),
                lower_tail_1_when_mean_2=float(poisson.cdf(1, 2)),
                lower_tail_10_when_mean_20=float(poisson.cdf(10, 20)),
                at_least_8_when_mean_10=float(poisson.sf(7, 10)),
                at_most_5_when_mean_10=float(poisson.cdf(5, 10)))


def plot(path):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib.ticker import PercentFormatter
    fig, axes = plt.subplots(1, 2, figsize=(12, 4.8), layout='constrained')
    for ax, p, lo, hi in [(axes[0], .02, 0, 44), (axes[1], .2, 145, 256)]:
        k = np.arange(lo, hi)
        ax.bar(k, binom.pmf(k, 1000, p), color='#2563eb', alpha=.65,
               label=f'Binomial(1000, {p})')
        ax.plot(k, poisson.pmf(k, 1000*p), color='#e66b10', lw=2,
                label=f'Poisson({1000*p:g})')
        ax.set(title=f'p = {p:.0%}', xlabel='Event count K', ylabel='Probability')
        ax.yaxis.set_major_formatter(PercentFormatter(1, decimals=1))
        ax.legend()
    fig.savefig(path, dpi=180)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--plot', help='Optional output image path')
    args = parser.parse_args()
    print(json.dumps(metrics(), indent=2))
    if args.plot:
        plot(args.plot)
