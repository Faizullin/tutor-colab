export const supportedLanguages: Record<string, { image: string, command: string }> = {
    python: { 
      image: 'python:latest', 
      command: 'python /app/script.py' 
    },
    javascript: { 
      image: 'node:latest', 
      command: 'node /app/script.js' 
    },
    typescript: { 
      image: 'node:latest', 
      command: 'npx ts-node /app/script.ts' 
    },
    java: {
      image: 'openjdk:latest',
      command: 'javac /app/Main.java && java -cp /app Main'
    },
    c: {
      image: 'gcc:latest',
      command: 'gcc -o /app/program /app/script.c && /app/program'
    },
    cpp: {
      image: 'gcc:latest',
      command: 'g++ -o /app/program /app/script.cpp && /app/program'
    }
  };