#include <vector>
#include <cmath>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#endif

class fenwick_tree
{
    std::vector<double> tree{};
    std::vector<double> squareTree{};
    std::vector<double> cubeTree{};
    std::vector<double> fourthTree{};

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

    double private_cumulative_sum(std::vector<double> &tree, int low, int high)
    {
        if (low > 0)
            return getSum(tree, high) - getSum(tree, low - 1);
        else
            return getSum(tree, high);
    }

    double private_interval_average(std::vector<double> &tree, int low, int high)
    {
        if (low > 0)
            return (getSum(tree, high) - getSum(tree, low - 1)) / (high - low + 1);

        return getAverage(tree, high);
    }

public:
    fenwick_tree(const std::vector<double> &arr)
    {
        // Fill the trees with zeros
        tree.resize(arr.size() + 1, 0);
        squareTree.resize(arr.size() + 1, 0);
        cubeTree.resize(arr.size() + 1, 0);
        fourthTree.resize(arr.size() + 1, 0);

        // Store the actual values in the trees using update()
        for (int i = 0; i < arr.size(); i++)
        {
            updateHelper(tree, i, arr[i]);
            updateHelper(squareTree, i, arr[i] * arr[i]);
            updateHelper(cubeTree, i, std::pow(arr[i], 3));
            updateHelper(fourthTree, i, std::pow(arr[i], 4));
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

        double x = currentVal;
        double x2 = currentVal * currentVal;
        double x3 = std::pow(currentVal, 3);
        double y = diff;
        double y2 = diff * diff;
        double y3 = std::pow(diff, 3);
        double y4 = std::pow(diff, 4);

        // Number to be added = 2xy + y * y
        updateHelper(squareTree, index, 2 * currentVal * diff + diff * diff);

        // Number to be added = 3(x^2)y + 3x(y^2) + y^3
        updateHelper(cubeTree, index, 3 * x2 * y + 3 * x * y2 + y3);

        // Number to be added = 4(x^3)y + 6(x^2)(y^2) + 4x(y^3) + y^4
        updateHelper(fourthTree, index, 4 * x3 * y + 6 * x2 * y2 + 4 * x * y3 + y4);
    }

    /* cumulative sum from low to high (inclusive) */
    /* O(log n), with n being the number of recorded days */
    double cumulative_sum(int low, int high)
    {
        return private_cumulative_sum(tree, low, high);
    }

    /* average of arr[] from index low to index high */
    /* O(log n), with n being the number of recorded days */
    double interval_average(int low, int high)
    {
        return private_interval_average(tree, low, high);
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
        double sum = private_cumulative_sum(tree, low, high);
        double squareSum = private_cumulative_sum(squareTree, low, high);

        return (squareSum - (sum * sum / n)) / n;
    }

    /* standard deviation */
    /* O(log n), with n being the number of recorded days */
    double interval_standard_deviation(int low, int high)
    {
        return std::sqrt(interval_variance(low, high));
    }

    /* O(plog n), where p is the length of the period and n is the number of recorded days */
    double aroon_up(int low, int high)
    {
        int interval = high - low + 1;
        double max = -1e9;
        int maxIndex = -1;
        for (int i = low; i <= high; ++i)
        {
            double currentVal = cumulative_sum(i, i);
            if (max < currentVal)
            {
                max = currentVal;
                maxIndex = i;
            }
        }
        double num_periods_since = high - maxIndex;
        return 100.0 * (interval - num_periods_since) / interval;
    }

    /* O(plog n), where p is the length of the period and n is the number of recorded days */
    double aroon_down(int low, int high)
    {
        // Let the period be determined by whether or not
        // the user chose to use intraday (5 min), daily (1 day), weekly (7 days), etc.
        int interval = high - low + 1;

        double min = 1e9;
        int minIndex = -1;
        for (int i = low + 1; i <= high; ++i)
        {
            double currentVal = cumulative_sum(i, i);
            if (min > currentVal)
            {
                min = currentVal;
                minIndex = i;
            }
        }
        double num_periods_since = high - minIndex;
        return 100.0 * (interval - num_periods_since) / interval * 1.0;
    }

    double ema(int low, int high)
    {
        // Initialize smoothing factor and EMA_0
        double k = 2 / (double)(high - low + 2);
        double emaY = private_cumulative_sum(tree, low, low);
        double priceT;
        double emaT;

        // Calculate EMA_high iteratively
        for (int i = low + 1; i <= high; ++i)
        {
            priceT = private_cumulative_sum(tree, i, i);
            emaT = priceT * k + emaY * (1 - k);
            emaY = emaT;
        }
        return emaT;
    }

    double interval_kurtosis(int low, int high)
    {
        // Size of the data
        double n = high - low + 1;

        // Calculate expressions for the formula
        double expression1 = n * (n + 1) / ((n - 1) * (n - 2) * (n - 3));
        double expression3 = (3 * std::pow(n - 1, 2)) / ((n - 2) * (n - 3));

        // Calculate the mean for the interval
        double mean = private_interval_average(tree, low, high);

        // Make population standard deviation into sample standard deviation
        double stddev = interval_standard_deviation(low, high) * std::sqrt(n / (n - 1));

        double fourthSum = private_cumulative_sum(fourthTree, low, high);
        double cubeSum = private_cumulative_sum(cubeTree, low, high);
        double squareSum = private_cumulative_sum(squareTree, low, high);
        double mean2 = mean * mean;
        double mean4 = std::pow(mean, 4);

        double expression2 = (fourthSum - 4 * mean * cubeSum + 6 * mean2 * squareSum - 3 * mean4 * n) / std::pow(stddev, 4);

        return expression1 * expression2 - expression3;
    }
};

EMSCRIPTEN_BINDINGS(fenwick_tree)
{
    emscripten::register_vector<double>("VectorDouble");

    emscripten::class_<fenwick_tree>("fenwick_tree")
        .constructor<std::vector<double>>()
        .function("update", &fenwick_tree::update)
        .function("cumulative_sum", &fenwick_tree::cumulative_sum)
        .function("interval_average", &fenwick_tree::interval_average)
        .function("interval_variance", &fenwick_tree::interval_variance)
        .function("interval_standard_deviation", &fenwick_tree::interval_standard_deviation)
        .function("aroon_up", &fenwick_tree::aroon_up)
        .function("aroon_down", &fenwick_tree::aroon_down)
        .function("ema", &fenwick_tree::ema)
        .function("kurtosis", &fenwick_tree::interval_kurtosis);
};

int main()
{
    return 0;
}