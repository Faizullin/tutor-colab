const DefaultCppCode = `
#include <iostream>

class Tmp {
public:
    Tmp* peer = nullptr;  // pointer to another Tmp object (can form circular reference)

    void print(int value) {
        std::cout << value;
    }
};

int main() {
    // Create two objects and make them reference each other
    Tmp obj1;
    Tmp obj2;

    obj1.peer = &obj2;
    obj2.peer = &obj1;

    obj1.print(42);  // prints 42

    int l = 10;
    unsigned long m = 0;
    long numbers[5] = {100000L, 200000L, 300000L, 400000L, 500000L};
    char tempo = 's';

    int* x = new int[3];
    x[1] = 20;
    int* p = &x[1];  // pointer into middle
    const char** fruit = new const char*[3];
    fruit[1] = "bananas";

    std::cout << "\nYum " << *p << " " << fruit[1] << " " << m << "\n";

    // Clean up the allocated memory
    delete[] x;
    delete[] fruit;

    return 0;
}

`;

const DefaultPyCode = `
def listSum(numbers):
	  if not numbers:
	    return 0
	  else:
	    (f, rest) = numbers
	    return f + listSum(rest)
	
	myList = (1, (2, (3, None)))
	total = listSum(myList)
`;

const DefaultCode = {
  cpp: DefaultCppCode,
  py: DefaultPyCode,
};

export default DefaultCode;
