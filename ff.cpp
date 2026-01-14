#include <iostream>
using namespace std;

int main() {
    int x = 10;
    
    if (x > 5) {
        cout << "Greater than 5";
    }
    
    if (x < 0) {
        cout << "Negative";
    } else if (x == 0) {
        cout << "Zero";
    } else {
        cout << "Positive";
    }
    
    return 0;
}