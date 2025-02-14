pragma circom 0.5.46;

template Arithmetic() {
    // Define input signals.
    signal input a;
    signal input b;
    
    // Define output signals.
    signal output sum;
    signal output product;

    // Compute the sum and product.
    sum <== a + b;
    product <== a * b;
}

// Instantiate the arithmetic circuit as the main component.
component main = Arithmetic();
