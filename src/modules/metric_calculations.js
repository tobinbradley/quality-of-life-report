function sum(arr) {
    let sum = arr.reduce(function(sum, x) {
        return sum + x;
    }, 0);
    if (arr.length === 0) { sum = '--'; }
    return sum;
}

function mean(arr) {
    return sum(arr) / arr.length;
}

function weighted(arr, weight) {
    let sumR = sum(arr);
    let sumW = sum(weight);
    return sumR / sumW;
}

export {sum, mean, weighted};
