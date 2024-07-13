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

    /* helper function to update fenwick tree */
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

    /* sum from arr[0] to arr[index] (inclusive) */
    /* O(log n), with n being the number of recorded days*/
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
    /* O(log n), with n being the number of recorded days*/
    double getAverage(const std::vector<double> &tree, int index)
    {
        if (index < 0)
            return -1;
        return getSum(tree, index) / (index + 1);
    }

    /* cumulative sum of square tree from low to high (inclusive) */
    /* O(log n), with n being the number of recorded days*/
    double cumulative_sum_squares(int low, int high)
    {
        if (low > 0)
            return getSum(squareTree, high) - getSum(squareTree, low - 1);
        else
            return getSum(squareTree, high);
    }

public:
    fenwick_tree(const std::vector<double> &arr)
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
    /* O(log n), with n being the number of recorded days*/
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
    /* O(log n), with n being the number of recorded days*/
    double cumulative_sum(int low, int high)
    {
        if (low > 0)
            return getSum(tree, high) - getSum(tree, low - 1);
        else
            return getSum(tree, high);
    }

    /* average of arr[] from index low to index high */
    /* O(log n), with n being the number of recorded days*/
    double interval_average(int low, int high)
    {
        if (low > 0)
            return getAverage(tree, high) - getAverage(tree, low - 1);

        return getAverage(tree, high);
    }

    /* variance of arr[] from index low to index high */
    /* O(log n), with n being the number of recorded days*/
    double interval_variance(int low, int high)
    {
        /*
            Formula for calculating variance:
            (sum(x_i * x_i) - (sum(x_i) * sum(x_i) / n)) / n
        */
        double n = (high - low + 1) * 1.0; // Size of the dataset
        double sum = cumulative_sum(low, high);
        double squareSum = cumulative_sum_squares(low, high);

        return (squareSum - (sum * sum / n)) / n;
    }

    /* standard deviation */
    /* O(log n), with n being the number of recorded days*/
    double interval_standard_deviation(int low, int high)
    {
        return std::sqrt(interval_variance(low, high));
    }
};

EMSCRIPTEN_BINDINGS(fenwick_tree)
{
    emscripten::class_<fenwick_tree>("fenwick_tree")
        .constructor<std::vector<double>>()
        .function("update", &fenwick_tree::update)
        .function("cumulative_sum", &fenwick_tree::cumulative_sum)
        .function("interval_average", &fenwick_tree::interval_average)
        .function("interval_variance", &fenwick_tree::interval_variance)
        .function("interval_standard_deviation", &fenwick_tree::interval_standard_deviation);
}

int main()
{
    // std::vector<double> arr = {1.0, 2.0, 3.0, 4.0, 5.0, 6.0};
    // fenwick_tree fenwick(arr);

    // int low = 0;
    // int high = 5;
    // std::cout << "Sum of arr: " << fenwick.cumulative_sum(low, high) << std::endl;

    // std::cout << "Variance: " << fenwick.interval_variance(low, high) << std::endl;
    // std::cout << "Standard Deviation: " << fenwick.interval_standard_deviation(low, high) << std::endl;
    // std::cout << "Average: " << fenwick.interval_average(low, high) << std::endl;

    // fenwick.update(2, 6.0);

    // std::cout << "\nVariance after update: " << fenwick.interval_variance(low, high) << std::endl;
    // std::cout << "Standard Deviation after update: " << fenwick.interval_standard_deviation(low, high) << std::endl;
    // std::cout << "Average after update: " << fenwick.interval_average(low, high) << std::endl;

    return 0;
}