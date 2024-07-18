#include <iostream>
#include <vector>
#include <cmath>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

class fenwick_tree
{
    std::vector<double> tree;
    std::vector<double> squareTree;
    int size; // Size of the original array

    /* sum from arr[0] to arr[index] (inclusive) */
    /* O(log n), with n being the number of recorded days */
    double getSum(const std::vector<double> &tree, int index)
    {
        double sum = 0;
        index++;
        while (index > 0)
        {
            sum += tree[index];
            index -= index & (-index);
        }
        return sum;
    }

    /* average from arr[0] to arr[index] (inclusive) */
    /* O(log n), with n being the number of recorded days */
    double getAverage(const std::vector<double> &tree, int index)
    {
        if (index < 0)
            return -1;

        return getSum(tree, index) / (index + 1);
    }

    /* Helper functions */

    void updateHelper(std::vector<double> &tree, int index, double val)
    {
        // index in tree[] is 1 more than the index in arr[]
        index++;

        // Traverse all ancestors and add val
        while (index <= tree.size())
        {
            // Add val to current node
            tree[index] += val;

            // Update index to parent index
            index += index & (-index);
        }
    }

    double cumulative_sum(std::vector<double> &tree, int low, int high)
    {
        if (low > 0)
            return getSum(tree, high) - getSum(tree, low - 1);
        else
            return getSum(tree, high);
    }

    double interval_average(std::vector<double> &tree, int low, int high)
    {
        if (low > 0)
            return getAverage(tree, high) - getAverage(tree, low - 1);

        return getAverage(tree, high);
    }

public:
    fenwick_tree(const std::vector<double> &arr) : size(arr.size())
    {
        // Fill the trees with zeros
        tree.resize(arr.size() + 1, 0);
        squareTree.resize(arr.size() + 1, 0);

        // Store the actual values in the trees using update()
        for (int i = 0; i < arr.size(); i++)
        {
            updateHelper(tree, i, arr[i]);
            updateHelper(squareTree, i, arr[i] * arr[i]);
        }
    }

    /* update fenwick tree to correspond with original array after update to element at index */
    /* O(log n), with n being the number of recorded days */
    void update(int index, double val)
    {
        double currentVal = cumulative_sum(index, index);
        double diff = val - currentVal;

        // Add the difference between the new value and old value to all relevent nodes
        updateHelper(tree, index, diff);

        // Number to be added = 2xy + y * y; y = diff, x = currentVal
        updateHelper(squareTree, index, 2 * currentVal * diff + diff * diff);
    }

    /* cumulative sum from low to high (inclusive) */
    /* O(log n), with n being the number of recorded days */
    double cumulative_sum(int low, int high)
    {
        return cumulative_sum(tree, low, high);
    }

    /* average of arr[] from index low to index high */
    /* O(log n), with n being the number of recorded days */
    double interval_average(int low, int high)
    {
        return interval_average(tree, low, high);
    }

    /* variance of arr[] from index low to index high */
    /* O(log n), with n being the number of recorded days */
    double interval_variance(int low, int high)
    {
        /*
            Formula for calculating variance:
            (sum(x_i * x_i) - (sum(x_i) * sum(x_i) / n)) / n
        */
        double n = high - low + 1; // Size of the dataset
        double sum = cumulative_sum(tree, low, high);
        double squareSum = cumulative_sum(squareTree, low, high);

        return (squareSum - (sum * sum / n)) / n;
    }

    /* standard deviation */
    /* O(log n), with n being the number of recorded days */
    double interval_standard_deviation(int low, int high)
    {
        return std::sqrt(interval_variance(low, high));
    }

    /* O(plog n), where p is the length of the period and n is the number of recorded days */
    double aroon_up(int period)
    {
        double max = -1e9;
        int maxIndex = -1;
        for (int i = size - 25 * period; i < 25; ++i)
        {
            double currentVal = cumulative_sum(i, i);
            if (max < currentVal)
            {
                max = currentVal;
                maxIndex = i;
            }
        }
        double num_periods_since = (size - maxIndex) / (double)period;
        return 100.0 * (25.0 - size - num_periods_since) / 25.0;
    }

    /* O(plog n), where p is the length of the period and n is the number of recorded days */
    double aroon_down(int period)
    {
        double min = 1e9;
        int minIndex = -1;
        for (int i = size - 25 * period; i < 25; ++i)
        {
            double currentVal = cumulative_sum(i, i);
            if (min > currentVal)
            {
                min = currentVal;
                minIndex = i;
            }
        }
        double num_periods_since = (size - minIndex) / (double)period;
        return 100.0 * (25.0 - size - num_periods_since) / 25.0;
    }
};

/* Calculate the rsi for an interval using fenwick trees representing gains and losses */
/* O(log n + log m), where n is the number of gains and m is the number of losses */
double interval_rsi_fenwick(fenwick_tree &gains, fenwick_tree &losses, int low, int high)
{
    double gainAverage = gains.interval_average(low, high);
    double lossAverage = losses.interval_average(low, high);

    if (lossAverage == 0)
        return 100;

    double rs = gainAverage / lossAverage;
    return 100 - (100 / (1 + rs));
}

// EMSCRIPTEN_BINDINGS(fenwick_tree)
// {
//     emscripten::class_<fenwick_tree>("fenwick_tree")
//         .constructor<std::vector<double>>()
//         .function("update", &fenwick_tree::update)
//         .function("cumulative_sum", &fenwick_tree::cumulative_sum)
//         .function("interval_average", &fenwick_tree::interval_average)
//         .function("interval_variance", &fenwick_tree::interval_variance)
//         .function("interval_standard_deviation", &fenwick_tree::interval_standard_deviation);
// }

int main()
{
    // std::vector<double> tree = {150.23, 152.35, 151.00, 153.45, 154.00, 152.75, 155.10, 157.25, 156.50, 158.75, 159.50, 160.00, 158.25, 160.75};
    // fenwick_tree f(tree);

    // std::cout << f.interval_rsi(0, tree.size() - 1) << std::endl;
    return 0;
}
