// #include <iostream>
#include <vector>
#include <cmath>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

class fenwick_tree
{
    std::vector<double> tree;
    std::vector<double> squareTree;

    void update(std::vector<double> &tree, int index, double val)
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

public:
    fenwick_tree(const std::vector<double> &arr)
    {
        // Fill the trees with zeros
        tree.resize(arr.size() + 1, 0);
        squareTree.resize(arr.size() + 1, 0);

        // Store the actual values in the trees using update()
        for (int i = 0; i < arr.size(); i++)
        {
            update(tree, i, arr[i]);
            update(squareTree, i, arr[i] * arr[i]);
        }
    }

    void update(int index, double val)
    {
        double currentVal = getRangeSum(index, index);
        double diff = val - currentVal;

        // Add the difference between the new value and old value to all relevent nodes
        update(tree, index, diff);

        // Number to be added = 2xy + y * y; y = diff, x = currentVal
        update(squareTree, index, 2 * currentVal * diff + diff * diff);
    }

    double getSum(int index)
    {
        return getSum(tree, index);
    }

    double getRangeSum(int low, int high)
    {
        if (low > 0)
            return getSum(tree, high) - getSum(tree, low - 1);
        else
            return getSum(tree, high);
    }

    double getAverage(int index)
    {
        if (index < 0)
            return -1;

        return getSum(index) / (index + 1);
    }

    double variance(int index)
    {
        /*
            Formula for calculating variance:
            (sum(x_i * x_i) - (sum(x_i) * sum(x_i) / n)) / (n - 1)
        */
        int n = index + 1; // Size of the dataset
        double squareSum = getSum(squareTree, index);
        double sum = getSum(tree, index);

        return (squareSum - (sum * sum / n)) / n;
    }

    double standardDeviation(int index)
    {
        return std::sqrt(variance(index));
    }
};
EMSCRIPTEN_BINDINGS(fenwick_tree)
{
    emscripten::class_<fenwick_tree>("fenwick_tree")
        .constructor<std::vector<double>>()
        .function("getSum", &fenwick_tree::getSum)
        .function("getRangeSum", &fenwick_tree::getRangeSum)
        .function("getAverage", &fenwick_tree::getAverage);
}

int main()
{
    // std::vector<double> arr = {1.0, 2.0, 3.0, 4.0, 5.0};
    // fenwick_tree fenwick(arr);

    // std::cout << "Variance: " << fenwick.variance(4) << std::endl;
    // std::cout << "Standard Deviation: " << fenwick.standardDeviation(4) << std::endl;
    // std::cout << "Average: " << fenwick.getAverage(4) << std::endl;

    // fenwick.update(2, 6.0);

    // std::cout << "\nVariance after update: " << fenwick.variance(4) << std::endl;
    // std::cout << "Standard Deviation after update: " << fenwick.standardDeviation(4) << std::endl;
    // std::cout << "Average after update: " << fenwick.getAverage(4) << std::endl;

    return 0;
}
