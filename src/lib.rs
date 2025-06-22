use itertools::Itertools;
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

/// プログラミング形式(prog)とLaTeX形式(tex)の数式を保持する構造体
#[wasm_bindgen]
#[derive(Clone, PartialEq, Eq, Hash, Debug)]
pub struct Expression {
    #[wasm_bindgen(getter_with_clone)]
    pub prog: String,
    #[wasm_bindgen(getter_with_clone)]
    pub tex: String,
}

#[cfg(feature = "panic-hook")]
#[wasm_bindgen(start)]
pub fn set_panic_hook() {
    console_error_panic_hook::set_once();
}

/// JavaScriptから呼び出されるエントリーポイント関数
#[wasm_bindgen]
pub fn find_calculation(numbers: &[u32], target: i32, limit: usize) -> Vec<Expression> {
    if numbers.is_empty() || limit == 0 {
        return Vec::new();
    }

    // Expression構造体そのものを格納し、progとtex両方を含めて重複を排除する
    let mut found_expressions: HashSet<Expression> = HashSet::new();

    for p in numbers.iter().permutations(numbers.len()) {
        if found_expressions.len() >= limit {
            break;
        }

        let nums: Vec<u32> = p.into_iter().cloned().collect();
        let mut cache = HashMap::new();
        let results = solve(&nums, &mut cache);

        if let Some(exprs) = results.get(&target) {
            for expr in exprs {
                found_expressions.insert(expr.clone());
                if found_expressions.len() >= limit {
                    break;
                }
            }
        }
    }

    found_expressions.into_iter().collect()
}

fn solve(
    nums: &[u32],
    cache: &mut HashMap<Vec<u32>, HashMap<i32, HashSet<Expression>>>,
) -> HashMap<i32, HashSet<Expression>> {
    if let Some(cached_result) = cache.get(nums) {
        return cached_result.clone();
    }

    let n = nums.len();
    let mut results: HashMap<i32, HashSet<Expression>> = HashMap::new();

    if n == 1 {
        let num = nums[0] as i32;
        let num_str = num.to_string();
        results.entry(num).or_default().insert(Expression {
            prog: num_str.clone(),
            tex: num_str,
        });
    }

    for i in 1..n {
        let left_nums = &nums[..i];
        let right_nums = &nums[i..];
        let left_results = solve(left_nums, cache);
        let right_results = solve(right_nums, cache);

        for (&val1, exprs1) in &left_results {
            for (&val2, exprs2) in &right_results {
                for expr1 in exprs1 {
                    for expr2 in exprs2 {
                        if let Some(res) = val1.checked_add(val2) {
                            results.entry(res).or_default().insert(Expression {
                                prog: format!("({} + {})", expr1.prog, expr2.prog),
                                tex: format!("({} + {})", expr1.tex, expr2.tex),
                            });
                        }
                        if let Some(res) = val1.checked_sub(val2) {
                            results.entry(res).or_default().insert(Expression {
                                prog: format!("({} - {})", expr1.prog, expr2.prog),
                                tex: format!("({} - {})", expr1.tex, expr2.tex),
                            });
                        }
                        if let Some(res) = val2.checked_sub(val1) {
                            results.entry(res).or_default().insert(Expression {
                                prog: format!("({} - {})", expr2.prog, expr1.prog),
                                tex: format!("({} - {})", expr2.tex, expr1.tex),
                            });
                        }
                        if let Some(res) = val1.checked_mul(val2) {
                            results.entry(res).or_default().insert(Expression {
                                prog: format!("({} * {})", expr1.prog, expr2.prog),
                                tex: format!("({} \\times {})", expr1.tex, expr2.tex),
                            });
                        }
                        if val2 != 0 && val1 % val2 == 0 {
                            if let Some(res) = val1.checked_div(val2) {
                                results.entry(res).or_default().insert(Expression {
                                    prog: format!("({} / {})", expr1.prog, expr2.prog),
                                    tex: format!("({} \\div {})", expr1.tex, expr2.tex),
                                });
                            }
                        }
                        if val1 != 0 && val2 % val1 == 0 {
                            if let Some(res) = val2.checked_div(val1) {
                                results.entry(res).or_default().insert(Expression {
                                    prog: format!("({} / {})", expr2.prog, expr1.prog),
                                    tex: format!("({} \\div {})", expr2.tex, expr1.tex),
                                });
                            }
                        }
                        if let Ok(exp) = u32::try_from(val2) {
                            if let Some(pow_val) = val1.checked_pow(exp) {
                                results.entry(pow_val).or_default().insert(Expression {
                                    prog: format!("{} ^ {}", expr1.prog, expr2.prog),
                                    tex: format!("{{{}}}^{{{}}}", expr1.tex, expr2.tex),
                                });
                            }
                        }
                        if let Ok(exp) = u32::try_from(val1) {
                            if let Some(pow_val) = val2.checked_pow(exp) {
                                results.entry(pow_val).or_default().insert(Expression {
                                    prog: format!("{} ^ {}", expr2.prog, expr1.prog),
                                    tex: format!("{{{}}}^{{{}}}", expr2.tex, expr1.tex),
                                });
                            }
                        }
                        if let Some(log_res) = int_log(val2, val1) {
                            results.entry(log_res).or_default().insert(Expression {
                                prog: format!("log{{{}}}{{{}}}", expr2.prog, expr1.prog),
                                tex: format!("\\log_{{{}}}{{{}}}", expr2.tex, expr1.tex),
                            });
                        }
                        if let Some(log_res) = int_log(val1, val2) {
                            results.entry(log_res).or_default().insert(Expression {
                                prog: format!("log{{{}}}{{{}}}", expr1.prog, expr2.prog),
                                tex: format!("\\log_{{{}}}{{{}}}", expr1.tex, expr2.tex),
                            });
                        }
                    }
                }
            }
        }
    }

    let mut unary_results: HashMap<i32, HashSet<Expression>> = HashMap::new();
    for (&val, exprs) in &results {
        for expr in exprs {
            if let Some(fact_val) = checked_factorial(val) {
                if fact_val != val {
                    let tex = if expr.prog.chars().all(char::is_numeric) {
                        format!("{}!", expr.tex)
                    } else {
                        format!("({})!", expr.tex)
                    };
                    unary_results
                        .entry(fact_val)
                        .or_default()
                        .insert(Expression {
                            prog: format!("fact{{{}}}", expr.prog),
                            tex,
                        });
                }
            }
            if val >= 0 {
                if let Some(sqrt_i) = (val as f64).sqrt().to_int() {
                    if sqrt_i != val {
                        unary_results.entry(sqrt_i).or_default().insert(Expression {
                            prog: format!("sqrt{{{}}}", expr.prog),
                            tex: format!("\\sqrt{{{}}}", expr.tex),
                        });
                    }
                }
            }
        }
    }

    for (val, exprs_to_add) in unary_results {
        results.entry(val).or_default().extend(exprs_to_add);
    }
    cache.insert(nums.to_vec(), results.clone());
    results
}

trait ToInt {
    fn to_int(self) -> Option<i32>;
}
impl ToInt for f64 {
    fn to_int(self) -> Option<i32> {
        if self.fract() == 0.0 {
            Some(self as i32)
        } else {
            None
        }
    }
}
fn checked_factorial(n: i32) -> Option<i32> {
    if n < 0 || n > 20 {
        return None;
    }
    let mut res: i32 = 1;
    for i in 2..=n {
        if let Some(next_res) = res.checked_mul(i) {
            res = next_res;
        } else {
            return None;
        }
    }
    Some(res)
}
fn int_log(base: i32, num: i32) -> Option<i32> {
    if base <= 1 || num <= 0 {
        return None;
    }
    if num == 1 {
        return Some(0);
    }
    let mut current = base;
    let mut result = 1;
    while current < num {
        if let Some(next_val) = current.checked_mul(base) {
            current = next_val;
            result += 1;
        } else {
            return None;
        }
    }
    if current == num { Some(result) } else { None }
}
