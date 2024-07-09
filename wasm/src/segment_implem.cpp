#include <vector>
#include <algorithm>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#endif

/* Range query sum/min/max segment tree implementation */
class segment_tree{
public:
  std::vector<double> sum_tree;
  std::vector<double> min_tree;
  std::vector<double> max_tree;
  int num_nodes; 

  segment_tree(int n): num_nodes(n), sum_tree(2*n, 0), min_tree(2*n, 0), max_tree(2*n, 0){}

  void build(std::vector<double>& arr){
    for(int i = num_nodes; i < 2*num_nodes; ++i){ 
      sum_tree[i] = arr[i - num_nodes];
      min_tree[i] = arr[i - num_nodes];
      max_tree[i] = arr[i - num_nodes];
    }
    for(int i = num_nodes - 1; i > 0; --i){ 
      sum_tree[i] = sum_tree[i<<1] + sum_tree[i<<1|1];
      min_tree[i] = std::min(min_tree[i<<1], min_tree[i<<1|1]);
      max_tree[i] = std::max(max_tree[i<<1], max_tree[i<<1|1]);
    }
  }

  void set(int idx, double val){ 
    idx += num_nodes;
    int temp = idx;

    // updating cumulative sum tree
    double diff = val - sum_tree[idx];
    for(; idx > 0; idx /= 2){ sum_tree[idx] += diff; }
    
    // updating ongoing minimum tree
    idx = temp;
    min_tree[idx] = val;
    for(idx /= 2; idx > 0; idx /= 2){ min_tree[idx] = std::min(min_tree[idx<<1], min_tree[idx<<1|1]); }

    // updating ongoing maximum tree
    idx = temp;
    max_tree[idx] = val;
    for(idx /= 2; idx > 0; idx /= 2){ max_tree[idx] = std::max(max_tree[idx<<1], max_tree[idx<<1|1]); }
  } 
  
  /* cumulative sum from idx_l to idx_r (inclusive) */
  double cumulative_sum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    double total_sum = 0;

    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) total_sum += sum_tree[idx_l++];
      if(!(idx_r&1)) total_sum += sum_tree[idx_r--];
    }

    return total_sum;
  }

  /* average stock price from idx_l to idx_r (inclusive) */
  double average_stock(int idx_l, int idx_r){
    double total_sum = cumulative_sum(idx_l, idx_r);

    return total_sum * 1.0f / (idx_r - idx_l + 1);  
  }

  double interval_minimum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    double minimum_val = 1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) minimum_val = std::min(minimum_val, min_tree[idx_l++]);
      if(!(idx_r&1)) minimum_val = std::min(minimum_val, min_tree[idx_r--]);
    }

    return minimum_val;
  }

  double interval_maximum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    double maximum_val = -1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) maximum_val = std::max(maximum_val, max_tree[idx_l++]);
      if(!(idx_r&1)) maximum_val = std::max(maximum_val, max_tree[idx_r--]);
    }

    return maximum_val;
  }
};

EMSCRIPTEN_BINDINGS(segment_tree){
  emscripten::class_<segment_tree>("segment_tree")
    .constructor<int>()
    .function("build", &segment_tree::build)
    .function("set", &segment_tree::set)
    .function("cummulative_sum", &segment_tree::cumulative_sum)
    .function("average_stock", &segment_tree::average_stock)
    .function("interval_minimum", &segment_tree::interval_minimum)
    .function("interval_maximum", &segment_tree::interval_maximum);
}

int main(){
  return 0;
}
