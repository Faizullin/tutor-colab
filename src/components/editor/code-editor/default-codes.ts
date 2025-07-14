const DefaultCppCode = `
#include <iostream>

int main() {
  int* x = new int[3];
  x[1] = 20;
  int* p = &x[1]; // pointer into middle
  int m = (*p )* 2;
  if (m ==40) {
    std::cout << "x[1] is 20";
  } else {
    std::cout<<"x[1] is not 20";
  }
  const char** fruit = new const char*[3];
  fruit[1] = "bananas";
  std::cout << "Yum " << *p << " " << fruit[1];
  return 0;
}
`;

const DefaultCode = {
  cpp: DefaultCppCode,
};

export default DefaultCode;
