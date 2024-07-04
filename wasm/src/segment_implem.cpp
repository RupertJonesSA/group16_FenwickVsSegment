#include <vector>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

/* Range query sum/min/max segment tree implementation */
template<class T> struct segment_tree{
  std::vector<T> sum_tree;
  std::vector<T> min_tree;
  std::vector<T> max_tree;
  int num_nodes; 

  segment_tree(int n): num_nodes(n), sum_tree(2*n, 0), min_tree(2*n, 0), max_tree(2*n, 0){}

  void build(std::vector<T>& arr){
    for(int i = num_nodes; i < 2*num_nodes; ++i){ 
      sum_tree[i] = arr[i - num_nodes];
      min_tree[i] = arr[i - num_nodes];
      max_tree[i] = arr[i - num_nodes];
    }
    for(int i = num_nodes - 1; i > 0; --i){ 
      sum_tree[i] = sum_tree[i<<1] + sum_tree[i<<1|1];
      min_tree[i] = min(min_tree[i<<1], min_tree[i<<1|1]);
      max_tree[i] = max(max_tree[i<<1], max_tree[i<<1|1]);
    }
  }

  void set(int idx, T val){ 
    idx += num_nodes;
    int temp = idx;

    // updating cumulative sum tree
    T diff = val - sum_tree[idx];
    for(; idx > 0; idx /= 2){ sum_tree[idx] += diff; }
    
    // updating ongoing minimum tree
    idx = temp;
    min_tree[idx] = val;
    for(idx /= 2; idx > 0; idx /= 2){ min_tree[idx] = min(min_tree[idx<<1], min_tree[idx<<1|1]); }

    // updating ongoing maximum tree
    idx = temp;
    max_tree[idx] = val;
    for(idx /= 2; idx > 0; idx /= 2){ max_tree[idx] = max(max_tree[idx<<1], max_tree[idx<<1|1]); }
  } 
  
  /* cumulative sum from idx_l to idx_r (inclusive) */
  long long cumulative_sum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    long long total_sum = 0;

    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) total_sum += sum_tree[idx_l++];
      if(!(idx_r&1)) total_sum += sum_tree[idx_r--];
    }

    return total_sum;
  }

  /* average stock price from idx_l to idx_r (inclusive) */
  double average_stock(int idx_l, int idx_r){
    long long total_sum = cumulative_sum(idx_l, idx_r);

    return total_sum * 1.0f / (idx_r - idx_l + 1);  
  }

  long long interval_minimum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    long long minimum_val = 1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) minimum_val = min(minimum_val, min_tree[idx_l++]);
      if(!(idx_r&1)) minimum_val = min(minimum_val, min_tree[idx_r--]);
    }

    return minimum_val;
  }

  long long interval_maximum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    long long maximum_val = 1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) maximum_val = min(maximum_val, max_tree[idx_l++]);
      if(!(idx_r&1)) maximum_val = min(maximum_val, max_tree[idx_r--]);
    }

    return maximum_val;
  }
};

template<typename T>
EMSCRIPTEN_KEEPALIVE
long long getIntevalSums(std::vector<T>& stock_prices, int idx_l, int idx_r){
  int n = stock_prices.size();
  
  segment_tree<T> tree(n);
  tree.build(stock_prices);

  return tree.cumulative_sum(idx_l, idx_r);
}

template<typename T>
EMSCRIPTEN_KEEPALIVE
long long getIntevalMinimum(std::vector<T>& stock_prices, int idx_l, int idx_r){
  int n = stock_prices.size();
  
  segment_tree<T> tree(n);
  tree.build(stock_prices);

  return tree.interval_minimum(idx_l, idx_r);
}

template<typename T>
EMSCRIPTEN_KEEPALIVE
long long getIntevalMaximum(std::vector<T>& stock_prices, int idx_l, int idx_r){
  int n = stock_prices.size();
  
  segment_tree<T> tree(n);
  tree.build(stock_prices);

  return tree.interval_maximum(idx_l, idx_r);
}

int main(){
  return 0;
}
