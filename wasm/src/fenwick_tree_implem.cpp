#include <vector>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

class fenwick_tree {
    std::vector<double> tree;

    void update(int index, double val) {
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
public:
    fenwick_tree(std::vector<double> arr) {
        // Fill the tree with zeros
        tree.resize(arr.size() + 1, 0);

        // Store the actual values in tree[] using update()
        for (int i = 0; i < arr.size(); i++)
            update(i, arr[i]);
    }

    double getSum(int index) {
        double sum = 0;

        // index in tree[] is 1 more than the index in arr[]
        index++;
        while (index > 0) {
            // Add current element of tree to sum
            sum += tree[index];

            // Move index to parent node
            index -= index & (-index);
        }
        return sum;
    }

    double getRangeSum(int low, int high) {
        if (low > 0)
            return getSum(high) - getSum(low - 1);
        else
            return getSum(high);
    }

    double getAverage(int index) {
        if (index < 0)
            return -1;

        return static_cast<double>(getSum(index)) / (index + 1);
    }
};

EMSCRIPTEN_BINDINGS(fenwick_tree){
  emscripten::class_<fenwick_tree>("fenwick_tree")
    .constructor<std::vector<double>>()
    .function("getSum", &fenwick_tree::getSum)
    .function("getRangeSum", &fenwick_tree::getRangeSum)
    .function("getAverage", &fenwick_tree::getAverage);
}

int main() {
    return 0;
}
