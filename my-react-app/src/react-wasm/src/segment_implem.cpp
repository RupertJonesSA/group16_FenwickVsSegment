#include <vector>
#include <string>
#include <algorithm>
#include <cmath>

#ifdef __EMSCRIPTEN__
#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#endif

using std::vector;
using std::string;
using std::min;
using std::max;

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
    int n = idx_r - idx_l;
    double mean = interval_average(idx_l, idx_r);
    idx_l += num_nodes; idx_r += num_nodes;
    
    for(int i = idx_l; i < idx_r; ++i){ variance += (sum_tree[i] - mean) * (sum_tree[i] - mean); }

    return (variance / n);
  }
 
  /* O(log n + m), where n is the number of recorded days and m is number of days in the interval */
  double interval_standard_deviation(int idx_l, int idx_r){
    return std::sqrt(interval_variance(idx_l, idx_r));
  } 
  
  /* O(n), where n is the amount of days of stock price recording */
  vector<double> aroon_down(int idx_l, int idx_r){
    vector<double> cumulative_aroon; 
    int n = idx_r - idx_l + 1; 
    
    idx_l += num_nodes; idx_r += num_nodes;

    int end = idx_l + 1;
    double past_min = min_tree[idx_l];
    int past_idx = end;
    
    while(end <= idx_r){
      double curr_tick = min_tree[end];
      if(curr_tick < past_min){
        past_min = curr_tick;
        past_idx = end;
      }

      double aroon_indicator = (n - (end - past_min)) * 100 / n * 1.0;
      cumulative_aroon.push_back(aroon_indicator);
      ++end;
    }

    return cumulative_aroon;
  }
  
  /* O(n), where n is the amount of days of stock price recording */
  vector<double> aroon_up(int idx_l, int idx_r){
    vector<double> cumulative_aroon; 
    int n = idx_r - idx_l + 1; 
    
    idx_l += num_nodes; idx_r += num_nodes;

    int end = idx_l + 1;
    double past_max = max_tree[idx_l];
    int past_idx = end;
    
    while(end <= idx_r){
      double curr_tick = max_tree[end];
      if(curr_tick > past_max){
        past_max = curr_tick;
        past_idx = end;
      }

      double aroon_indicator = (n - (end - past_max)) * 100 / n * 1.0;
      cumulative_aroon.push_back(aroon_indicator);
      ++end;
    }

    return cumulative_aroon;
  }
};

/* O(nlog n + mlog n), where n is the number of recording days and m is the amount of 
* days in the interval*/
extern "C"{
  EMSCRIPTEN_KEEPALIVE
  double compute_rsi(double* prices, int idx_l, int idx_r, int n){
    vector<double> gains(n - 1);
    vector<double> losses(n - 1);  

    for(int i = 0; i < n - 1; ++i){
      double diff = prices[i+1] - prices[i];   
      if(diff < 0){
        losses.push_back(-diff);
        gains.push_back(0);
      }else if(diff > 0){
        losses.push_back(0);
        gains.push_back(diff);
      }else{
        losses.push_back(0);
        gains.push_back(0);
      }
    }

    segment_tree gains_tree(gains.size());
    segment_tree losses_tree(losses.size());
    gains_tree.build(gains);
    losses_tree.build(losses);
    
    return gains_tree.getRandom();

    double average_gains = gains_tree.interval_average(idx_l, idx_r);
    double average_losses = losses_tree.interval_average(idx_l, idx_r);
    double rsi = 100.0 - (100.0 / 1 + (average_gains / average_losses));
    
    return rsi;  
  }
}

EMSCRIPTEN_BINDINGS(segment_tree){
  emscripten::class_<segment_tree>("segment_tree")
    .constructor<int>()
    .function("build", &segment_tree::build)
    .function("set", &segment_tree::set)
    .function("cummulative_sum", &segment_tree::cumulative_sum)
    .function("interval_average", &segment_tree::interval_average)
    .function("interval_minimum", &segment_tree::interval_minimum)
    .function("interval_maximum", &segment_tree::interval_maximum)
    .function("interval_variance", &segment_tree::interval_variance)
    .function("aroon_up", &segment_tree::aroon_up)
    .function("aroon_down", &segment_tree::aroon_down);
}

int main(){
  return 0;
}
