#include <vector>
#include <string>
#include <algorithm>
#include <cmath>
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#endif

using std::vector;
using std::string;
using std::min;
using std::max;
using std::sqrt;

/* Range query sum/min/max segment tree implementation */
class segment_tree{
public:
  vector<double> sum_tree;
  vector<double> min_tree;
  vector<double> max_tree;
  int num_nodes; 

  segment_tree(int n): num_nodes(n), sum_tree(2*n, 0), min_tree(2*n, 0), max_tree(2*n, 0){}
  
  /* O(nlog n), with n being the number of recorded days*/
  void build(vector<double>& arr){
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
   
  /* O(log n), with n being the number of recorded days*/
  void set(int idx, double val){ 
    idx += num_nodes;
    int temp = idx;

    // updating cumulative sum tree
    double diff = val - sum_tree[idx];
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
  /* O(log n), with n being the number of recorded days*/
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
  /* O(log n), with n being the number of recorded days*/
  double interval_average(int idx_l, int idx_r){
    double total_sum = cumulative_sum(idx_l, idx_r);

    return total_sum * 1.0f / (idx_r - idx_l + 1);  
  }
 
  /* O(log n), with n being the number of recorded days*/
  double interval_minimum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    double minimum_val = 1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) minimum_val = min(minimum_val, min_tree[idx_l++]);
      if(!(idx_r&1)) minimum_val = min(minimum_val, min_tree[idx_r--]);
    }

    return minimum_val;
  }
  
  /* O(log n), with n being the number of recorded days*/
  double interval_maximum(int idx_l, int idx_r){
    idx_l += num_nodes, idx_r += num_nodes;
    double maximum_val = -1e9;
    
    for(; idx_l <= idx_r; idx_l >>= 1, idx_r >>= 1){
      if(idx_l&1) maximum_val = max(maximum_val, max_tree[idx_l++]);
      if(!(idx_r&1)) maximum_val = max(maximum_val, max_tree[idx_r--]);
    }

    return maximum_val;
  }
  
  /* O(log n + m), where n is the number of recorded days, and m is the number of days in the interval*/
  double interval_variance(int idx_l, int idx_r){
    double variance = 0.0;
    int n = idx_r - idx_l + 1;
    double mean = interval_average(idx_l, idx_r);
    idx_l += num_nodes; idx_r += num_nodes;
    
    for(int i = idx_l; i <= idx_r; ++i){ variance += (sum_tree[i] - mean) * (sum_tree[i] - mean); }

    return (variance / n);
  }
 
  /* O(log n + m), where n is the number of recorded days and m is number of days in the interval */
  double interval_standard_deviation(int idx_l, int idx_r){
    return std::sqrt(interval_variance(idx_l, idx_r));
  } 
  
  /* O(p + log n), where p is the length of the period and n is the number of recorded days */
  double aroon_down(int idx_l, int idx_r){
    int interval = idx_r - idx_l + 1; 
    
    double period_min = interval_minimum(idx_l, idx_r);
    int min_idx = 0;
    
    for(int i = idx_l; i <= idx_r; ++i){
      if(sum_tree[i+num_nodes] == period_min){ min_idx = i;}
    } 
    
    int periods_since_last_min = idx_r - min_idx; // have to add one due to min_idx being zero-indexed

    return ((interval - periods_since_last_min * 1.0) / interval * 1.0) * 100.0;
  }
  
  /* O(p), where p is the numer of periods */
  double aroon_up(int idx_l, int idx_r){
    int interval = idx_r - idx_l + 1; 
    
    double period_max = interval_maximum(idx_l, idx_r);  
    int max_idx = 0;
    
    for(int i = idx_l; i <= idx_r; ++i){
      if(sum_tree[i + num_nodes] == period_max){ max_idx = i;}
    }
    
    int periods_since_last_max = idx_r - max_idx; 

    return ((interval * 1.0 - periods_since_last_max) / interval * 1.0) * 100.0;
  }
  
  /* O(p), where p is the number of periods*/
  double interval_ema(int idx_l, int idx_r){
    int n = idx_r - idx_l + 1;

    // Base case => Inital price
    double ema_0 = sum_tree[idx_l+num_nodes];
    
    // smoothing factor provides greater weight to the most
    // prices in the calculation.
    double smoothing_factor = 2.0 / (n + 1);
    double prev_ema = ema_0;
    double curr_ema = 0.0;
    double curr_price = 0.0; 
    
    // Recursive formula => EMA_i = sf*price_i + (1-sf)*EMA_{i-1}
    for(int i = idx_l+1; i <= idx_r; ++i){
      curr_price = sum_tree[i+num_nodes];
      curr_ema = (smoothing_factor*curr_price) + (1-smoothing_factor)*(prev_ema);

      prev_ema = curr_ema;
    }

    return curr_ema;
  }
  
  /* O(p + log n), where p is the number of periods and n is the total recorded days in the tree */
  double interval_kurtosis(int idx_l, int idx_r){
    double n = idx_r - idx_l + 1;

    double eq1 = (n * (n+1)) / ((n-1) * (n-2) * (n-3));
    double eq3 = (3.0 * (n-1) * (n-1)) / ((n-2) * (n-3));
    
    // Convert population stddev to sample stddev
    double stddev = interval_standard_deviation(idx_l, idx_r) * std::sqrt(n / (n-1));
    double mean = interval_average(idx_l, idx_r);

    double eq2 = 0.0;
    double curr_price;
    
    // eq2 = sum(((x_i - mean) / stddev)^4)
    for(int i = idx_l; i <= idx_r; ++i){
      curr_price = sum_tree[i + num_nodes];
      double term = (curr_price - mean) / stddev;
      eq2 += (term * term * term * term);
    }

    return eq1 * eq2 - eq3;
  }
};

double compute_rsi(vector<double>& prices, int idx_l, int idx_r, int n){
  vector<double> gains(n-1);
  vector<double> losses(n-1);  

  for(int i = 0; i < n - 1; ++i){
    double diff = prices[i+1] - prices[i];
    if(diff < 0){
      losses[i] = -diff;
      gains[i] = 0;
    }else if(diff > 0){
      losses[i] = 0;
      gains[i] = diff;
    }else{
      losses[i] = 0;
      gains[i] = 0;
    }
  }
  
  segment_tree gains_tree(n-1);
  segment_tree losses_tree(n-1);
  gains_tree.build(gains);
  losses_tree.build(losses);

  double average_gains = gains_tree.interval_average(idx_l, idx_r);
  double average_losses = losses_tree.interval_average(idx_l, idx_r);
  double rsi = average_losses ? 100.0 - (100.0 / (1 + average_gains / average_losses)) : 100.0;

  return rsi;
}


EMSCRIPTEN_BINDINGS(segment_tree){
  
  emscripten::register_vector<double>("VectorDouble");
  emscripten::function("compute_interval_rsi", &compute_rsi); 

  emscripten::class_<segment_tree>("segment_tree")
    .constructor<int>()
    .function("build", &segment_tree::build)
    .function("set", &segment_tree::set)
    .function("cumulative_sum", &segment_tree::cumulative_sum)
    .function("interval_average", &segment_tree::interval_average)
    .function("interval_minimum", &segment_tree::interval_minimum)
    .function("interval_maximum", &segment_tree::interval_maximum)
    .function("interval_variance", &segment_tree::interval_variance)
    .function("interval_standard_deviation", &segment_tree::interval_standard_deviation)
    .function("aroon_up", &segment_tree::aroon_up)
    .function("aroon_down", &segment_tree::aroon_down)
    .function("interval_ema", &segment_tree::interval_ema)
    .function("interval_kurtosis", &segment_tree::interval_kurtosis);
};

// int main(){
//   vector<double> data = {2.9, 3.4, 7.8, 5.5, 6.6, 7.7, 23.3};
//   segment_tree segTree(data.size());
//   segTree.build(data);
//   std::cout << segTree.interval_kurtosis(0, data.size()-1) << "   " << segTree.interval_ema(0, data.size()-1) << "\n";
//   std::cout << segTree.interval_standard_deviation(0, data.size()-1) << " " << segTree.interval_average(0, data.size()-1);
// }
